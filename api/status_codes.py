def NotFound():
    return {
        "status": 404,
        "message": "No results could be found."
    }, 404


def BadRequest():
    return {
        "status": 400,
        "message": "Bad Request."
    }, 400


def OK():
    return {
        "status": 200,
        "message": "Ok."
    }, 200
