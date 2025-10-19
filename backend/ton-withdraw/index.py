'''
Business: Handle TON wallet withdrawal requests with database integration
Args: event with httpMethod, body (wallet_address, amount)
Returns: HTTP response with withdrawal transaction details
'''
import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

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
    
    if not wallet_address or amount <= 0:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid request', 'message': 'Wallet address and valid amount required'}),
            'isBase64Encoded': False
        }
    
    min_withdraw = 100
    if amount < min_withdraw:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Amount too small', 'message': f'Minimum withdrawal is {min_withdraw} TON'}),
            'isBase64Encoded': False
        }
    
    dsn = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(dsn)
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cur.execute("SELECT * FROM users WHERE wallet_address = %s", (wallet_address,))
        user = cur.fetchone()
        
        if not user:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'User not found'}),
                'isBase64Encoded': False
            }
        
        if float(user['balance']) < amount:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Insufficient balance', 'available': float(user['balance'])}),
                'isBase64Encoded': False
            }
        
        fee = max(1, int(amount * 0.01))
        net_amount = amount - fee
        
        cur.execute(
            "UPDATE users SET balance = balance - %s, total_withdrawn = total_withdrawn + %s, updated_at = CURRENT_TIMESTAMP WHERE id = %s RETURNING balance",
            (amount, net_amount, user['id'])
        )
        result = cur.fetchone()
        
        withdrawal_id = f"WD-{int(datetime.now().timestamp())}"
        
        cur.execute(
            "INSERT INTO transactions (user_id, type, amount, fee, status, wallet_address, metadata) VALUES (%s, 'withdrawal', %s, %s, 'pending', %s, %s) RETURNING id",
            (user['id'], amount, fee, wallet_address, json.dumps({'withdrawal_id': withdrawal_id}))
        )
        tx_result = cur.fetchone()
        
        conn.commit()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'withdrawalId': withdrawal_id,
                'transactionId': tx_result['id'],
                'status': 'pending',
                'amount': amount,
                'fee': fee,
                'netAmount': net_amount,
                'walletAddress': wallet_address,
                'remainingBalance': float(result['balance']),
                'estimatedTime': '5-15 minutes',
                'message': 'Withdrawal request created successfully'
            }),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
