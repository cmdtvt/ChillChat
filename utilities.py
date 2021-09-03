import asyncio
def run_in_executor():
    async def __decorator(*args, **kwargs):
        def run_function():
            return function(*args, **kwargs)
        return await asyncio.get_event_loop().run_in_executor(None, run_function)