/**
 * Business: Handle TON wallet withdrawal requests
 * Args: event with httpMethod, body (userId, amount, walletAddress)
 * Returns: HTTP response with withdrawal transaction details
 */

exports.handler = async (event, context) => {
    const { httpMethod, body } = event;
    
    if (httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            body: '',
            isBase64Encoded: false
        };
    }
    
    if (httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method not allowed' }),
            isBase64Encoded: false
        };
    }

    const data = JSON.parse(body || '{}');
    
    if (!data.walletAddress || !data.amount || data.amount <= 0) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Invalid request',
                message: 'Wallet address and valid amount required' 
            }),
            isBase64Encoded: false
        };
    }

    const minWithdraw = 100;
    if (data.amount < minWithdraw) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Amount too small',
                message: `Minimum withdrawal is ${minWithdraw} TON` 
            }),
            isBase64Encoded: false
        };
    }

    const withdrawalId = `WD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fee = Math.max(1, Math.floor(data.amount * 0.01));
    const netAmount = data.amount - fee;

    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            success: true,
            withdrawalId,
            status: 'pending',
            amount: data.amount,
            fee,
            netAmount,
            walletAddress: data.walletAddress,
            estimatedTime: '5-15 minutes',
            message: 'Withdrawal request created successfully'
        }),
        isBase64Encoded: false
    };
};
