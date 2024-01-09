import pathlib
import pydantic
import ruamel.yaml
from typing import Type, Any, NewType, Callable, ParamSpec, Awaitable, cast, TypeVar
from ruamel.yaml.compat import StringIO
from functools import wraps, lru_cache
import json
import hashlib
import aiofiles
import aiofiles.os
import abc


NoValueType = NewType('NoValue', object)
NO_VALUE: NoValueType = NoValueType(object())


@lru_cache(maxsize=128)
def parse_yaml(s: str) -> Any:
    return ruamel.yaml.YAML().load(StringIO(s))


P = ParamSpec('P')
T = TypeVar('T')


class AsyncBaseCache[T](abc.ABC):
    def __init__(self, cache_name: str):
        self.cache_name = cache_name
        self.cache_dir = pathlib.Path(f'/cache') / cache_name
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
        key_str = json.dumps({ "args": args, "kwargs": kwargs })
        hash = hashlib.sha256()
        hash.update(key_str.encode('utf-8'))
        return hash.hexdigest()

    @abc.abstractmethod
    def load(self, data: bytes) -> T:
        raise NotImplementedError
    
    @abc.abstractmethod
    def dump(self, value: T) -> bytes:
        raise NotImplementedError


    async def get_cache_value(self, key: str) -> T | NoValueType:
        try:
            async with aiofiles.open(self.cache_dir / key, mode='rb') as f:
                return self.load(await f.read())
        except FileNotFoundError:
            return NO_VALUE

    async def set_cache_value(self, key: str, obj: T):
        async with aiofiles.tempfile.NamedTemporaryFile('wb', prefix=f'f{self.cache_name}-{key}', dir=self.cache_dir) as f:
            await f.write(self.dump(obj))
            # atomically rename-into-place
            await aiofiles.os.rename(str(f.name), self.cache_dir / key)


PT = TypeVar('PT', bound=pydantic.BaseModel)


class pydantic_yaml_cache(AsyncBaseCache[PT]):

    def __init__(self, Model: Type[PT], cache_name: str):
        super().__init__(cache_name)
        self.Model = Model

    def load(self, data: bytes) -> PT:
        obj = parse_yaml(data.decode('utf-8'))
        return self.Model.model_validate(obj)

    def dump(self, value: PT) -> bytes:
        stream = StringIO()
        ruamel.yaml.YAML().dump(value.model_dump(), stream)
        return stream.getvalue().encode('utf-8')
