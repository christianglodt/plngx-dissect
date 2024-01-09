import pathlib
import pydantic
import ruamel.yaml
from typing import Type, Any, NewType
from ruamel.yaml.compat import StringIO
from functools import wraps, lru_cache
import json
import hashlib
import aiofiles
import aiofiles.os


NoValueType = NewType('NoValue', object)
NO_VALUE: NoValueType = NoValueType(object())


def cache_key(args: list[Any], kwargs: dict[str, Any]) -> str:
    key_str = json.dumps({ "args": args, "kwargs": kwargs })
    hash = hashlib.sha256()
    hash.update(key_str.encode('utf-8'))
    return hash.hexdigest()


def _get_cache_dir(cache_name: str) -> pathlib.Path:
    cache_dir = pathlib.Path(f'/cache') / cache_name
    cache_dir.mkdir(parents=True, exist_ok=True)
    return cache_dir


@lru_cache(maxsize=128)
def parse_yaml(s: str) -> Any:
    return ruamel.yaml.YAML().load(StringIO(s))


async def get_cache_value(cache_name: str, key: str, Model: Type[pydantic.BaseModel]) -> pydantic.BaseModel | NoValueType:
    try:
        async with aiofiles.open(_get_cache_dir(cache_name) / key, mode='r', encoding='utf-8') as f:
            contents = await f.read()
            obj = parse_yaml(contents)
            return Model.model_validate(obj)
    except FileNotFoundError:
        return NO_VALUE


async def set_cache_value(cache_name: str, key: str, obj: pydantic.BaseModel):
    async with aiofiles.tempfile.NamedTemporaryFile('w', encoding='utf-8', prefix=f'f{cache_name}-{key}', dir=_get_cache_dir(cache_name)) as f:
        stream = StringIO()
        ruamel.yaml.YAML().dump(obj.model_dump(), stream)
        await f.write(stream.getvalue())
        # atomically rename-into-place
        await aiofiles.os.rename(str(f.name), _get_cache_dir(cache_name) / key)


def pydantic_yaml_cache(Model: Type[pydantic.BaseModel], cache_name: str):
    def inner(f):
        @wraps(f)
        async def wrapper(*args, **kwargs):
            key = cache_key(args, kwargs)
            cached_value = await get_cache_value(cache_name, key, Model)
            if cached_value != NO_VALUE:
                return cached_value
            
            value = await f(*args, **kwargs)
            await set_cache_value(cache_name, key, value)

            return value
        return wrapper
    return inner
