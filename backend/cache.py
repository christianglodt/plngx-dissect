import pathlib
import pydantic
from typing import Type, Any, NewType, Callable, ParamSpec, Awaitable, TypeVar, AsyncIterable, Hashable
import ryaml
from functools import wraps, lru_cache
import abc
import sys
import io
import asyncio
import functools
import diskcache


NoValueType = NewType('NoValueType', object)
NO_VALUE: NoValueType = NoValueType(object())

P = ParamSpec('P')
T = TypeVar('T')

CACHE_PATH = pathlib.Path('../data/cache').resolve()


CACHES = {
    'pdf_page_svg': diskcache.Cache(CACHE_PATH / 'pdf_page_svg', size_limit=500_000_000),
    'parsed_document': diskcache.Cache(CACHE_PATH / 'parsed_document', size_limit=500_000_000)
}


async def cache_get_async(cache: diskcache.Cache, key: str, read: bool = False):
    loop = asyncio.get_running_loop()
    future = loop.run_in_executor(None, functools.partial(cache.get, key, read=read))
    result = await future
    return result


async def cache_set_async(cache: diskcache.Cache, key: str, value: bytes):
    loop = asyncio.get_running_loop()
    future = loop.run_in_executor(None, cache.set, key, value)
    result = await future
    return result


ExtraCacheKeyFunc = Callable[..., Awaitable[tuple[Hashable, ...]]]


async def cache_key[P](args: tuple[Any, ...], kwargs: dict[str, Any], ignore_kwargs: list[str] | None = None, extra_cache_key_func: ExtraCacheKeyFunc | None = None) -> str:
    kw = dict(kwargs)
    for ignore_kw in ignore_kwargs or []:
        kw.pop(ignore_kw, None)

    # TODO ensure all args and remaining kw args have stable hash codes...
    # print((args, tuple(kw.items())))
    
    extra_hash_key_values = (await extra_cache_key_func(*args, **kwargs)) if extra_cache_key_func else ()

    hash_int = hash((args, tuple(sorted(kw.items()))) + extra_hash_key_values)
    hash_int = hash_int % 2**sys.hash_info.width # Make sure hash is positive number (for legacy reasons)
    return str(hash_int)


class AsyncBaseCache[T](abc.ABC):
    def __init__(self, cache_id: str, ignore_kwargs: list[str] | None = None, extra_cache_key_func: ExtraCacheKeyFunc | None = None):
        self.cache = CACHES[cache_id]
        self.ignore_kwargs = ignore_kwargs
        self.extra_cache_key_func = extra_cache_key_func

    def __call__(self, f: Callable[P, Awaitable[T]]) -> Callable[P, Awaitable[T]]:
        @wraps(f)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            key = await cache_key(args, kwargs, self.ignore_kwargs, self.extra_cache_key_func)
            data = await cache_get_async(self.cache, key)
            if data is not None:
                return await self.load_from_cache(data)
            else:
                value = await f(*args, **kwargs)
                data = await self.dump_to_cache(value)
                await cache_set_async(self.cache, key, data)
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


class pydantic_yaml_cache(AsyncBaseCache[PT]):
    def __init__(self, Model: Type[PT], cache_name: str, ignore_kwargs: list[str] | None = None, extra_cache_key_func: ExtraCacheKeyFunc | None = None):
        super().__init__(cache_name, ignore_kwargs=ignore_kwargs, extra_cache_key_func=extra_cache_key_func)
        self.Model = Model

    async def load_from_cache(self, data: bytes) -> PT:
        return parse_yaml_and_validate_model(self.Model, data)

    async def dump_to_cache(self, value: PT) -> bytes:
        s = ryaml.dumps(value.model_dump(mode='json'))
        return s.encode('utf-8')


class AsyncIterableBytesCache:

    def __init__(self, cache_id: str, ignore_kwargs: list[str] | None = None, extra_cache_key_func: ExtraCacheKeyFunc | None = None):
        self.cache = CACHES[cache_id]
        self.ignore_kwargs = ignore_kwargs
        self.extra_cache_key_func = extra_cache_key_func

    def __call__(self, f: Callable[P, AsyncIterable[bytes]]) -> Callable[P, AsyncIterable[bytes]]:
        @wraps(f)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> AsyncIterable[bytes]:
            key = await cache_key(args, kwargs, self.ignore_kwargs, self.extra_cache_key_func)
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
                    # write to cache file
                    data_bytes.write(chunk)
                    # also yield to caller
                    yield chunk

                await cache_set_async(self.cache, key, data_bytes.getvalue())                
        return wrapper


stream_cache = AsyncIterableBytesCache
