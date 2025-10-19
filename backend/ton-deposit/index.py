'''
Business: Handle TON deposit confirmations and update user balance
Args: event with httpMethod, body (wallet_address, amount, tx_hash)
Returns: Deposit confirmation with updated balance
'''
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event, context):
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    data = json.loads(event.get('body', '{}'))
    wallet_address = data.get('wallet_address')
    amount = float(data.get('amount', 0))
    tx_hash = data.get('tx_hash', '')
    
    if not wallet_address or amount <= 0:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid wallet or amount'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("SELECT * FROM users WHERE wallet_address = %s", (wallet_address,))
        user = cur.fetchone()
        
        if not user:
            cur.execute(
                "INSERT INTO users (wallet_address, balance) VALUES (%s, 0) RETURNING *",
                (wallet_address,)
            )
            conn.commit()
            user = cur.fetchone()
        
        cur.execute(
            "UPDATE users SET balance = balance + %s, total_deposited = total_deposited + %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING balance",
            (amount, amount, user['id'])
        )
        result = cur.fetchone()
        
        cur.execute(
            "INSERT INTO transactions (user_id, type, amount, status, tx_hash, wallet_address, metadata) VALUES (%s, 'deposit', %s, 'completed', %s, %s, %s)",
            (user['id'], amount, tx_hash, wallet_address, json.dumps({'source': 'ton_connect'}))
        )
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'balance': float(result['balance']),
                'deposited': amount,
                'message': 'Deposit completed successfully'
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
