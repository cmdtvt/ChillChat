from quart import  Quart, render_template

app = Quart(__name__, )

@app.route('/')
async def hello():
    return await  render_template("views/home.html")

app.run()