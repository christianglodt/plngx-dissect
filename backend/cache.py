import pathlib
import pydantic
import ruamel.yaml
from typing import Type, Any, NewType, Callable, ParamSpec, Awaitable, cast
from ruamel.yaml.compat import StringIO
from functools import wraps, lru_cache
import json
import hashlib
import aiofiles
import aiofiles.os


NoValueType = NewType('NoValue', object)
NO_VALUE: NoValueType = NoValueType(object())


@lru_cache(maxsize=128)
def parse_yaml(s: str) -> Any:
    return ruamel.yaml.YAML().load(StringIO(s))


P = ParamSpec('P')

class pydantic_yaml_cache:
    def __init__(self, Model: Type[pydantic.BaseModel], cache_name: str):
        self.Model = Model
        self.cache_name = cache_name
        self.cache_dir = pathlib.Path(f'/cache') / cache_name
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def __call__(self, f: Callable[P, Awaitable[pydantic.BaseModel]]) -> Callable[P, Awaitable[pydantic.BaseModel]]:
        @wraps(f)
        async def wrapper(*args: P.args, **kwargs: P.kwargs) -> pydantic.BaseModel:
            key = self.cache_key(args, kwargs)
            cached_value = await self.get_cache_value(key, self.Model)
            if cached_value != NO_VALUE:
                return cast(pydantic.BaseModel, cached_value)
            
            value = await f(*args, **kwargs)
            await self.set_cache_value(key, value)

            return value
        return wrapper

    def cache_key(self, args: tuple[Any, ...], kwargs: dict[str, Any]) -> str:
        key_str = json.dumps({ "args": args, "kwargs": kwargs })
        hash = hashlib.sha256()
        hash.update(key_str.encode('utf-8'))
        return hash.hexdigest()

    async def get_cache_value(self, key: str, Model: Type[pydantic.BaseModel]) -> pydantic.BaseModel | NoValueType:
        try:
            async with aiofiles.open(self.cache_dir / key, mode='r', encoding='utf-8') as f:
                contents = await f.read()
                obj = parse_yaml(contents)
                return Model.model_validate(obj)
        except FileNotFoundError:
            return NO_VALUE

    async def set_cache_value(self, key: str, obj: pydantic.BaseModel):
        async with aiofiles.tempfile.NamedTemporaryFile('w', encoding='utf-8', prefix=f'f{self.cache_name}-{key}', dir=self.cache_dir) as f:
            stream = StringIO()
            ruamel.yaml.YAML().dump(obj.model_dump(), stream)
            await f.write(stream.getvalue())
            # atomically rename-into-place
            await aiofiles.os.rename(str(f.name), self.cache_dir / key)
