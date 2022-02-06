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
        if not args:
            key = "null"
        else:
            key = " ".join([str(x) for x in zip(args, kwargs.items())])
        return key

    async def save_async(self, func, key, *args, **kwargs):
        if func.__name__ not in self.cache:
            self.cache[func.__name__] = {}
        self.cache[func.__name__][key] = {"function": await func(*args, **kwargs)}
        self.cache[func.__name__][key]["timestamp"] = time.time()
        return self.cache[func.__name__][key]["function"]

    def save_sync(self, func, key, *args, **kwargs):
        self.cache[func.__name__][key] = {"function": func(*args, **kwargs)}
        self.cache[func.__name__][key]["timestamp"] = time.time()
        return self.cache[func.__name__][key]["function"]

    def __contains__(self, item):
        return True if item in self.cache.keys() else False

    def cached(self, timeout=600):
        def __decorator_wrapper(func):
            def __decorator(*args, **kwargs):
                key = Cache.generate_key(*args, **kwargs)
                if func.__name__ in self.cache:
                    if key in self.get(func.__name__) and time.time() - self.get(func.__name__)[key]["timestamp"] < timeout:
                        return self.get(func.__name__)[key]["function"]
                return self.save_sync(func, key, *args, **kwargs)
            return __decorator
        return __decorator_wrapper

    def async_cached(self, timeout=600):
        def __decorator_wrapper(func):
            async def __decorator(*args, **kwargs):
                key = Cache.generate_key(*args, **kwargs)
                if func.__name__ in self.cache:
                    if key in self.cache[func.__name__] and time.time() - self.get(func.__name__)[key]["timestamp"] < timeout:
                        return self.get(func.__name__)[key]["function"]
                return await self.save_async(func, key, *args, **kwargs)
            return __decorator
        return __decorator_wrapper
