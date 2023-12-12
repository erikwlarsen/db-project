from flask import Flask, Response, abort, request
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import os
import json
import regression

load_dotenv()

app = Flask(__name__)

engine = create_engine(os.environ.get("PG_CONNECTION"))

@app.get("/deaths-prediction")
def get_prediction():
    return Response(json.dumps(regression.get_death_prediction()), mimetype="application/json")

@app.get("/cod")
def get_cod():
    year = request.args.get("year")
    cdc_code = request.args.get("cdc_code")
    query = "SELECT name, deaths, cdc_cod_code, year FROM infirmity_deaths JOIN infirmity USING(infirmity_id) "
    if year is not None or cdc_code is not None:
        where_clause = "WHERE "
        if year is not None:
            where_clause += f"year = {year} "
            if cdc_code is not None:
                where_clause += f"AND cdc_cod_code = '{cdc_code}' "
        else:
            where_clause += f"cdc_cod_code = '{cdc_code}' "
        query += where_clause
    query += "ORDER BY year ASC, deaths DESC;"
    resp = []
    with engine.connect() as con:
        rs = con.execute(text(query))
        for row in rs:
            resp.append({ "year": row[3], "name": row[0], "cdc_code": row[2], "deaths": row[1] })
        if (len(resp) == 0):
            return abort(404)
        return Response(json.dumps(resp), mimetype="application/json")

@app.get("/infirmities")
def get_infirmities():
    resp = []
    with engine.connect() as con:
        rs = con.execute(text("SELECT name, cdc_cod_code FROM infirmity ORDER BY name ASC;"))
        for row in rs:
            resp.append({ "name": row[0], "cdc_code": row[1] })
    return Response(json.dumps(resp), mimetype="application/json")

@app.get("/search-terms")
def get_search_terms():
    year = request.args.get("year")
    query = "SELECT term, year, number FROM search_mentions "
    if year is not None:
        query += f"WHERE year = {year} "
    query += "ORDER BY year ASC, number DESC;"
    resp = []
    with engine.connect() as con:
        rs = con.execute(text(query))
        for row in rs:
            resp.append({ "term": row[0], "year": row[1], "number": row[2] })
    return Response(json.dumps(resp), mimetype="application/json")
