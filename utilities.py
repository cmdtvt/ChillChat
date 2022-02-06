import time
import asyncio


class Cache:
    def __init__(self,):
        self.cache = {}

    def add_and_get(self, key, item, timeout=600):
        self.add(key, item, timeout)
        return self.get(key, timeout)

    def add(self, key, item, timeout):
        if key in self.cache and timeout is not None:
            if time.time() - self.cache[key]["timestamp"] > timeout:
                self.cache[key]["item"] = item
                self.cache[key]["timestamp"] = time.time()
        elif key not in self.cache:
            self.cache[key] = {"item": item, "timestamp": time.time()}
        return

    def get(self, key, timeout):
        if key in self.cache and time.time() - self.cache[key]["timestamp"] < timeout:
            return self.cache[key]["item"]
        else:
            self.remove_key(key)
            return None

    def invalidate(self, func, key):
        if func.__name__ in self.cache and key in self.cache[func.__name__]:
            del self.cache[func.__name__][key]

    def remove_key(self, key):
        if key in self.cache:
            del self.cache[key]

    @staticmethod
    def generate_key(*args, **kwargs):
        key = None
        if args or kwargs:
            args = list(args)
            key = " ".join([str(x) for x in list(args) + list(kwargs.items())])
        else:
            key = "null"
        return key

    async def save_async(self, func, key, timeout, *args, **kwargs):
        return self.add_and_get(key, await func(*args, **kwargs), timeout)

    def save_sync(self, func, key, timeout, *args, **kwargs):
        return self.add_and_get(key, func(*args, **kwargs), timeout)

    def __contains__(self, item):
        return True if item in self.cache.keys() else False

    def cached(self, timeout=600):
        def __decorator_wrapper(func):
            def __decorator(*args, **kwargs):
                key = Cache.generate_key(*args, **kwargs)
                key = Cache.generate_key(func.__name__, key)
                print("Key", key)
                return self.get(key, timeout) or self.save_sync(func, key, timeout, *args, **kwargs)
            return __decorator
        return __decorator_wrapper

    def async_cached(self, timeout=600):
        def __decorator_wrapper(func):
            async def __decorator(*args, **kwargs):

                key = Cache.generate_key(func.__name__, *args, **kwargs)
                return self.get(key, timeout) or await self.save_async(func, key, timeout, *args, **kwargs)
            return __decorator
        return __decorator_wrapper
