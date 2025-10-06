import pathlib
import pydantic
from typing import Type, Any, Callable, ParamSpec, Awaitable, TypeVar, AsyncIterable, Hashable
import ryaml
from functools import wraps, lru_cache
import abc
import io
import asyncio
import functools
import diskcache



CacheKeyFunc = Callable[..., Awaitable[str]]

P = ParamSpec('P')
T = TypeVar('T')


CACHE_PATH = pathlib.Path('../data/cache').resolve()

CACHES = {
    'pdf_page_svg': diskcache.Cache(CACHE_PATH / 'pdf_page_svg', size_limit=500_000_000),
    'parsed_document': diskcache.Cache(CACHE_PATH / 'parsed_document', size_limit=500_000_000),
    'paperless_data': diskcache.Cache(CACHE_PATH / 'paperless_data', size_limit=50_000_000)
}


async def cache_get_async(cache: diskcache.Cache, key: str, read: bool = False) -> Any:
    loop = asyncio.get_running_loop()
    future = loop.run_in_executor(None, functools.partial(cache.get, key, read=read))
    result = await future
    return result


async def cache_set_async(cache: diskcache.Cache, key: str, value: Any, expire: float | None):
    loop = asyncio.get_running_loop()
    future = loop.run_in_executor(None, functools.partial(cache.set, key, value, expire=expire))
    result = await future
    return result


async def base_cache_key_func(*args: Hashable, **kwargs: Hashable) -> str:
    hash_int = hash((args, tuple(sorted(kwargs.items()))))
    return str(hash_int)


class AsyncCache[T](abc.ABC):
    def __init__(self, cache_id: str, cache_key_func: CacheKeyFunc | None = None, expire: float | None = None):
        self.cache = CACHES[cache_id]
        self.cache_key_func = cache_key_func or base_cache_key_func
        self.expire = expire

    def __call__(self, f: Callable[P, Awaitable[T]]) -> Callable[P, Awaitable[T]]:
        @wraps(f)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            key = await self.cache_key_func(*args, **kwargs)
            data = await cache_get_async(self.cache, key)
            if data is not None:
                return data
            else:
                value = await f(*args, **kwargs)
                await cache_set_async(self.cache, key, value, self.expire)
                return value

        return wrapper


class AsyncBytesCache[T](abc.ABC):
    def __init__(self, cache_id: str, cache_key_func: CacheKeyFunc | None = None, expire: float | None = None):
        self.cache = CACHES[cache_id]
        self.cache_key_func = cache_key_func or base_cache_key_func
        self.expire = expire

    def __call__(self, f: Callable[P, Awaitable[T]]) -> Callable[P, Awaitable[T]]:
        @wraps(f)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            key = await self.cache_key_func(*args, **kwargs)
            data = await cache_get_async(self.cache, key)
            if data is not None:
                return await self.load_from_cache(data)
            else:
                value = await f(*args, **kwargs)
                data = await self.dump_to_cache(value)
                await cache_set_async(self.cache, key, data, self.expire)
                return value

        return wrapper

    @abc.abstractmethod
    async def load_from_cache(self, data: bytes) -> T:
        raise NotImplementedError
    
    @abc.abstractmethod
    async def dump_to_cache(self, value: T) -> bytes:
        raise NotImplementedError


PT = TypeVar('PT', bound=pydantic.BaseModel)


@lru_cache(maxsize=1024)
def parse_yaml_and_validate_model(Model: Type[PT], s: bytes) -> PT:
    return Model.model_validate(ryaml.loads(s.decode('utf-8')))


class pydantic_yaml_cache(AsyncBytesCache[PT]):
    def __init__(self, Model: Type[PT], cache_name: str, cache_key_func: CacheKeyFunc | None = None, expire: float | None = None):
        super().__init__(cache_name, cache_key_func=cache_key_func)
        self.Model = Model

    async def load_from_cache(self, data: bytes) -> PT:
        return parse_yaml_and_validate_model(self.Model, data)

    async def dump_to_cache(self, value: PT) -> bytes:
        s = ryaml.dumps(value.model_dump(mode='json'))
        return s.encode('utf-8')


class AsyncIterableBytesCache:
    def __init__(self, cache_id: str, cache_key_func: CacheKeyFunc | None = None, expire: float | None = None):
        self.cache = CACHES[cache_id]
        self.cache_key_func = cache_key_func or base_cache_key_func
        self.expire = expire

    def __call__(self, f: Callable[P, AsyncIterable[bytes]]) -> Callable[P, AsyncIterable[bytes]]:
        @wraps(f)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> AsyncIterable[bytes]:
            key = await self.cache_key_func(*args, **kwargs)
            reader = await cache_get_async(self.cache, key, read=True)
            if reader is not None:
                while True:
                    chunk = reader.read(64000)
                    if not chunk:
                        break
                    yield chunk
            else:
                data_bytes = io.BytesIO()
                async for chunk in f(*args, **kwargs):
                    # write to cache file buffer
                    data_bytes.write(chunk)
                    # also yield to caller
                    yield chunk

                await cache_set_async(self.cache, key, data_bytes.getvalue(), self.expire)
        return wrapper


stream_cache = AsyncIterableBytesCache


class AsyncIterableCache[T]:
    def __init__(self, cache_id: str, cache_key_func: CacheKeyFunc | None = None, expire: float | None = None):
        self.cache = CACHES[cache_id]
        self.cache_key_func = cache_key_func or base_cache_key_func
        self.expire = expire

    def __call__(self, f: Callable[P, AsyncIterable[T]]) -> Callable[P, AsyncIterable[T]]:
        @wraps(f)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> AsyncIterable[T]:
            key = await self.cache_key_func(*args, **kwargs)
            values: list[T] | None = await cache_get_async(self.cache, key)
            if values is not None:
                for value in values:
                    yield value
            else:
                values = []
                async for value in f(*args, **kwargs):
                    values.append(value)
                    # also yield to caller
                    yield value

                await cache_set_async(self.cache, key, values, self.expire)
        return wrapper
