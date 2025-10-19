'''
Business: Manage user accounts, balances, and transactions
Args: event with httpMethod, body (wallet_address, action)
Returns: User data, balance, transaction history
'''
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event, context):
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Wallet-Address',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            wallet_address = event.get('queryStringParameters', {}).get('wallet')
            
            if not wallet_address:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Wallet address required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "SELECT * FROM users WHERE wallet_address = %s",
                (wallet_address,)
            )
            user = cur.fetchone()
            
            if not user:
                cur.execute(
                    "INSERT INTO users (wallet_address, balance) VALUES (%s, 0) RETURNING *",
                    (wallet_address,)
                )
                conn.commit()
                user = cur.fetchone()
            
            cur.execute(
                "SELECT * FROM inventory WHERE user_id = %s ORDER BY obtained_at DESC",
                (user['id'],)
            )
            inventory = cur.fetchall()
            
            cur.execute(
                "SELECT * FROM transactions WHERE user_id = %s ORDER BY created_at DESC LIMIT 50",
                (user['id'],)
            )
            transactions = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict(user),
                    'inventory': [dict(item) for item in inventory],
                    'transactions': [dict(tx) for tx in transactions]
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            data = json.loads(event.get('body', '{}'))
            action = data.get('action')
            wallet_address = data.get('wallet_address')
            
            if not wallet_address:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Wallet address required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("SELECT * FROM users WHERE wallet_address = %s", (wallet_address,))
            user = cur.fetchone()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            if action == 'update_balance':
                amount = float(data.get('amount', 0))
                cur.execute(
                    "UPDATE users SET balance = balance + %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING balance",
                    (amount, user['id'])
                )
                result = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'balance': float(result['balance'])}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unknown action'}),
                'isBase64Encoded': False
            }
    
    finally:
        cur.close()
        conn.close()
