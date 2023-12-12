from time import sleep

def wait_for_redshift_query(redshift_client, id):
    while (redshift_client.describe_statement(Id=id)['Status'] != 'FINISHED'):
        sleep(0.1)
