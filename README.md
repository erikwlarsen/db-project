# DB Final Project: Code Repo

This repo consists of two main projects: a Python data server (`trends-analysis/`) and a Node.js website (`insurance-webpage/`).

## trends-analysis

This Python data server is responsible for serving CDC cause of death data and Google Trends search data. This data is stored in AWS cloud databases: an RDS PostgreSQL database, and a Redshift database.

Additionally, this server performs linear regression to make predictions about the cause of death statistics in the current year.

This server is built using the Python Flask framework. It is hosted 

## insurance-webpage

This WIP webpage will be used for part 4 of the project. It is a front end for the insurance company that can display cause of death data and calculate insurance rates. On the back end, it communicates with the Python `trends-analysis` server.

This webpage is built in Node.js using the NextJS framework.
