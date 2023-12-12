import os
from sklearn import linear_model
from sqlalchemy import create_engine, text
import boto3
import util

redshift_client = boto3.client('redshift-data', region_name='us-east-1')

def get_death_prediction():
    engine = create_engine(os.environ.get("PG_CONNECTION"))

    data_dict = {
        2011: {},
        2012: {},
        2013: {},
        2014: {},
        2015: {},
        2016: {},
        2017: {},
        2018: {},
        2019: {},
        2020: {},
        2023: {},
    }

    deaths_dict = {
        2011: {},
        2012: {},
        2013: {},
        2014: {},
        2015: {},
        2016: {},
        2017: {},
        2018: {},
        2019: {},
        2020: {},
    }

    infirmity_ids_to_predict = []
    ordered_infirmities = []

    with engine.connect() as con:
        # get only diseases that appear in every year 2011-2020
        infirmity_rows = con.execute(text("""
                                        SELECT infirmity_id
                                        FROM infirmity_deaths
                                        WHERE year between 2011 and 2020
                                        GROUP BY infirmity_id
                                        HAVING COUNT(*) = 10;
                                        """))
        for row in infirmity_rows:
            infirmity_ids_to_predict.append(str(row[0]))


    with engine.connect() as con:
        all_terms = con.execute(text(f'SELECT name FROM infirmity WHERE infirmity_id IN ({",".join(infirmity_ids_to_predict)}) ORDER BY name asc;'))
        term_dict = {}
        for term_row in all_terms:
            term_dict[term_row[0]] = 0
            ordered_infirmities.append(term_row[0])
        for year in data_dict:
            deaths_dict[year] = term_dict.copy()

    with engine.connect() as con:
        infirmity_rows = con.execute(text(f"""
                                        SELECT year, i.name, deaths FROM infirmity_deaths
                                        JOIN infirmity i USING (infirmity_id)
                                        WHERE year between 2011 and 2020
                                        AND infirmity_id IN ({','.join(infirmity_ids_to_predict)});
                                        """))
        for row in infirmity_rows:
            deaths_dict[row[0]][row[1]] = row[2]

    query_resp = redshift_client.execute_statement(
        Database='dev',
        DbUser='awsuser',
        ClusterIdentifier='redshift-cluster-1',
        Sql='SELECT term FROM search_mentions WHERE year = 2016 ORDER BY term asc;'
    )
    util.wait_for_redshift_query(redshift_client, query_resp['Id'])
    all_terms_result = redshift_client.get_statement_result(Id=query_resp['Id'])
    term_dict = {}
    for term_row in all_terms_result['Records']:
        term_dict[term_row[0]['stringValue']] = 0
    for year in data_dict:
        data_dict[year] = term_dict.copy()

    select_query_resp = redshift_client.execute_statement(
        Database='dev',
        DbUser='awsuser',
        ClusterIdentifier='redshift-cluster-1',
        Sql='SELECT year, term, number FROM search_mentions WHERE year BETWEEN 2011 AND 2020 OR year = 2023;'
    )
    util.wait_for_redshift_query(redshift_client, select_query_resp['Id'])
    select_result = redshift_client.get_statement_result(Id=select_query_resp['Id'])
    for row in select_result['Records']:
        if data_dict[row[0]['longValue']][row[1]['stringValue']] == 0:
            data_dict[row[0]['longValue']][row[1]['stringValue']] = row[2]['longValue']
        else:
            print('whoopsie!', row[0], row[1], row[2])

    def dict_to_matrices(dict):
        Train = []
        Test = []
        for year in dict:
            if year == 2023:
                to_append = list(dict[year].values())
                Test.append(to_append)
            else:
                to_append = list(dict[year].values())
                Train.append(to_append)
        return (Train, Test)

    Xdata = dict_to_matrices(data_dict)
    ydata = dict_to_matrices(deaths_dict)

    reg = linear_model.LinearRegression()
    reg.fit(Xdata[0], ydata[0])

    y_pred = reg.predict(Xdata[1])[0]
    pred_dict = {}

    for i in range(len(ordered_infirmities)):
        pred_dict[ordered_infirmities[i]] = round(y_pred[i], 1)
    
    return dict(sorted(pred_dict.items(), key=lambda item: -item[1]))
