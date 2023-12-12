# DB Final Project: Code Repo

This repo consists of two main projects: a Python data server (`trends-analysis/`) and a Node.js website (`insurance-webpage/`).

## trends-analysis

This Python data server is responsible for serving CDC cause of death data and Google Trends search data. This data is stored in AWS cloud databases: an RDS PostgreSQL database, and a Redshift database.

Additionally, this server performs linear regression to make predictions about the cause of death statistics in the current year.

This server is built using the Python Flask framework. It is hosted on the Render cloud platform. It is publicly available and can be queried using the routes below.

### Get a prediction of the number of the number of deaths/cause of deaths
`https://db-project-python-server.onrender.com/deaths-prediction`

### Get CDC cause of death data
`https://db-project-python-server.onrender.com/cod`

Example filtering by year:

`https://db-project-python-server.onrender.com/cod?year=2014`

Example filtering by CDC cause of death code:

`https://db-project-python-server.onrender.com/cod?cdc_code=I42.9`

### Get data on causes of death and associated CDC codes
`https://db-project-python-server.onrender.com/infirmities`

### Get data on Google trends search terms
`https://db-project-python-server.onrender.com/search-terms`

## insurance-webpage

This WIP webpage will be used for part 4 of the project. It is a front end for the insurance company that can display cause of death data and calculate insurance rates. On the back end, it communicates with the Python `trends-analysis` server.

This webpage is built in Node.js using the NextJS framework.
