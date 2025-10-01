import pathlib
import pydantic
from typing import Type, Any, NewType, Callable, ParamSpec, Awaitable, cast, TypeVar, AsyncIterable
import ryaml
from functools import wraps, lru_cache
import aiofiles
import aiofiles.os
from aiofile import async_open, FileIOWrapperBase
import abc
import sys


NoValueType = NewType('NoValueType', object)
NO_VALUE: NoValueType = NoValueType(object())

P = ParamSpec('P')
T = TypeVar('T')

CACHE_PATH = pathlib.Path('../data/cache').resolve()

class AsyncBaseCache[T](abc.ABC):
    def __init__(self, cache_name: str, extension: str = '', ignore_kwargs: list[str] | None = None):
        self.cache_name = cache_name
        self.extension = extension
        self.ignore_kwargs = ignore_kwargs
        self.cache_dir = CACHE_PATH / cache_name
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def __call__(self, f: Callable[P, Awaitable[T]]) -> Callable[P, Awaitable[T]]:
        @wraps(f)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> T:
            key = self.cache_key(args, kwargs)
            cached_value = await self.get_cache_value(key)
            if cached_value != NO_VALUE:
                return cast(T, cached_value)
            
            value = await f(*args, **kwargs)
            await self.set_cache_value(key, value)

            return value
        return wrapper

    def cache_key(self, args: tuple[Any, ...], kwargs: dict[str, Any]) -> str:
        kw = dict(kwargs)
        for ignore_kw in self.ignore_kwargs or []:
            kw.pop(ignore_kw, None)

        # TODO ensure all args and remaining kw args have stable hash codes...
        # print((args, tuple(kw.items())))
        
        hash_int = hash((args, tuple(sorted(kw.items()))))
        # Ensure hash is positive because file names starting with '-' are inconvenient in the shell.
        hash_int = hash_int % 2**sys.hash_info.width
        return str(hash_int)

    @abc.abstractmethod
    async def load_from_cache(self, data_file: FileIOWrapperBase) -> T:
        raise NotImplementedError
    
    @abc.abstractmethod
    async def dump_to_cache(self, value: T) -> bytes:
        raise NotImplementedError

    async def get_cache_value(self, key: str) -> T | NoValueType:
        try:
            async with async_open((self.cache_dir / key).with_suffix(self.extension), mode='rb') as f:
                return await self.load_from_cache(f)
        except FileNotFoundError:
            return NO_VALUE

    async def set_cache_value(self, key: str, obj: T):
        async with aiofiles.tempfile.NamedTemporaryFile('wb', prefix=f'f{self.cache_name}-{key}', dir=self.cache_dir) as f:
            await f.write(await self.dump_to_cache(obj))
            # atomically rename-into-place
            await aiofiles.os.rename(str(f.name), (self.cache_dir / key).with_suffix(self.extension))


PT = TypeVar('PT', bound=pydantic.BaseModel)


@lru_cache(maxsize=1024)
def parse_yaml_and_validate_model(Model: Type[PT], s: bytes) -> PT:
    return Model.model_validate(ryaml.loads(s.decode('utf-8')))


class pydantic_yaml_cache(AsyncBaseCache[PT]):
    def __init__(self, Model: Type[PT], cache_name: str, ignore_kwargs: list[str] | None = None):
        super().__init__(cache_name, '.yml', ignore_kwargs=ignore_kwargs)
        self.Model = Model

    async def load_from_cache(self, data_file: FileIOWrapperBase) -> PT:
        data = await data_file.read()
        return parse_yaml_and_validate_model(self.Model, data) # type: ignore # ignore typing problem caused by lru_cache

    async def dump_to_cache(self, value: PT) -> bytes:
        s = ryaml.dumps(value.model_dump(mode='json'))
        return s.encode('utf-8')


# TODO cleanup!
class AsyncBytesIterableCache:
    def __init__(self, cache_name: str, extension: str = '', ignore_kwargs: list[str] | None = None):
        self.cache_name = cache_name
        self.extension = extension
        self.ignore_kwargs = ignore_kwargs
        self.cache_dir = CACHE_PATH / cache_name
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def __call__(self, f: Callable[P, AsyncIterable[bytes]]) -> Callable[P, AsyncIterable[bytes]]:
        @wraps(f)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> AsyncIterable[bytes]:
            key = self.cache_key(args, kwargs)
            try:
                async with async_open((self.cache_dir / key).with_suffix(self.extension), mode='rb') as cache_file:
                    async for data in cache_file.iter_chunked():
                        assert isinstance(data, bytes)
                        yield data
                return
            except FileNotFoundError:                
                async with aiofiles.tempfile.NamedTemporaryFile('wb', prefix=f'f{self.cache_name}-{key}', dir=self.cache_dir) as cache_file:
                    async for data in f(*args, **kwargs):
                        # write to cache file
                        await cache_file.write(data)
                        # also yield to caller
                        yield data
                    # atomically rename-into-place
                    await aiofiles.os.rename(str(cache_file.name), (self.cache_dir / key).with_suffix(self.extension))
        return wrapper

    def cache_key(self, args: tuple[Any, ...], kwargs: dict[str, Any]) -> str:
        kw = dict(kwargs)
        for ignore_kw in self.ignore_kwargs or []:
            kw.pop(ignore_kw, None)

        # TODO ensure all args and remaining kw args have stable hash codes...
        # print((args, tuple(kw.items())))
        
        hash_int = hash((args, tuple(sorted(kw.items()))))
        # Ensure hash is positive because file names starting with '-' are inconvenient in the shell.
        hash_int = hash_int % 2**sys.hash_info.width
        return str(hash_int)


stream_cache = AsyncBytesIterableCache
