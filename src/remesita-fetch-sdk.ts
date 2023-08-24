export const BASE_URL = "https://remesita.com";


// Modelos

export interface Business {
    id: string;
    name: string;
    description: string;
    logo: string;
    domain: string;
}

export interface TransferBetweenResponse {
    success: boolean;
    error?: string;
    tid?: string;
}

export interface CardToggleResponse {
    success: boolean;
    lockStatus: "locked" | "unlocked";
    error?: string;
}

export interface CardTransaction {
    id: number;
    type: string;
    date: string;
    amount: number;
    amountUSD: number;
    exchangeRate: number;
    currency: string;
    memo: string;
    category: string;
    payee: string;
    website: string;
    status: string;
}
 
export interface PaymentLinkResponse {
    link: string;
}

export interface AuthResponse {
    accessToken: string;
    user: {
        uid: string;
        name: string;
        phone: string;
        email: string;
        pictureUrl: string;
        mainCard: string;
        level: string;
        countryISO: string;
    };
}
export interface Card {
    balance: number;
    balanceFormatted: string;
    balanceUSD: number;
    balanceUSDFormatted: string;
    status: string;
    number: string;
    numberFormatted: string;
    exchangeRate: number;
    clabe: string;
    cashReference: string;
    locked: boolean;
    alias: string;
    main: boolean;
}

export interface Order {
    match: boolean;
    status: string;
    order: string;
    createdAt: string;
    completedAt: string;
    paymentMethod: string;
    sku: string;
    quotation: number;
    quotationCurrency: string;
    recipientAccount: string;
    recipientAmount: number;
}

export interface P2POperation {
    match: boolean;
    status: string;
    order: string;
    createdAt: string;
    completedAt: string;
    paymentMethod: string;
    sku: string;
    quotation: number;
    quotationCurrency: string;
    recipientAccount: string;
    recipientAmount: number;
}

export interface Balance {
    prepaidCardCombinedBalance: number;
    prepaidCardCombinedBalanceUsd: number;
    referralsCommission: number;
    usd2mxn: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}


class RemesitaAPI {
    private baseURL: string = 'https://remesita.com';
    private token: string | null = null;

    constructor(apiKey: string, apiSecret: string) {
        this.authenticate(apiKey, apiSecret);
    }

    private async makeRequest<T>(method: string, endpoint: string, body?: any): Promise<ApiResponse<T>> {
        const headers: any = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();

        if (response.ok) {
            return {
                success: true,
                data: data
            };
        } else {
            return {
                success: false,
                error: data.error
            };
        }
    }

    private async authenticate(apiKey: string, apiSecret: string): Promise<ApiResponse<AuthResponse>> {
        try { 
            const respone = await this.makeRequest<AuthResponse>('POST', `${this.baseURL}/rest/v1/auth`,   {
                api_key: apiKey,
                api_secret: apiSecret
            });
            if (response.success && response.data) {
                this.token = response.data.accessToken;
            } 
            return response;
        } catch (error) {
            return { success: false, error: error.message ?? 'Error authenticating' };
        }
    }

    private get headers() {
        if (!this.token) {
            throw new Error('Not authenticated');
        }
        return {
            Authorization: `${this.token}`
        };
    }

    public async getBusinesses(): Promise<ApiResponse<Business[]>> {
        try {
            const response = await this.makeRequest<AuthResponse>('GET', `${this.baseURL}/rest/v1/business`);  
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    public async transferBetweenAccounts(data: {
        from: string;
        to: string;
        amount: number;
        currency?: string;
        memo: string;
    }): Promise<ApiResponse<TransferBetweenResponse>> {
        try {
            const response = await this.makeRequest<AuthResponse>('POST', `${this.baseURL}/rest/v1/card/transfer-between`, data);   
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    public async toggleCardStatus(cardNumber: string): Promise<ApiResponse<CardToggleResponse>> {
        try {
            const response = await this.makeRequest<AuthResponse>('POST', `${this.baseURL}/rest/v1/card/${cardNumber}/toggle`, {}); 
            return response;
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    public async getCardTransactions(cardNumber: string, startDate?: string, endDate?: string): Promise<ApiResponse<CardTransaction[]>> {
        try {

             const response = await this.makeRequest<AuthResponse>('POST', `${this.baseURL}/rest/v1/card/${cardNumber}/transactions`, {
                start: startDate,
                end: endDate
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    public async getCardDetails(cardNumber: string): Promise<ApiResponse<Card>> {
        try {
            const response = await axios.get(`${this.baseURL}/rest/v1/card/${cardNumber}`, { headers: this.headers });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    public async getOrders(book?: string, marker?: string, sort?: string, limit?: number): Promise<ApiResponse<Order[]>> {
        try {
            const response = await axios.get(`${this.baseURL}/rest/v1/orders`, {
                headers: this.headers,
                params: {
                    book,
                    marker,
                    sort,
                    limit
                }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    public async getP2POperations(book?: string, marker?: string, sort?: string, limit?: number): Promise<ApiResponse<P2POperation[]>> {
        try {
            const response = await axios.get(`${this.baseURL}/rest/v1/p2p`, {
                headers: this.headers,
                params: {
                    book,
                    marker,
                    sort,
                    limit
                }
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    public async createPaymentLink(amount: number, memo: string): Promise<ApiResponse<PaymentLinkResponse>> {
        try {
            const response = await axios.post(`${this.baseURL}/rest/v1/payment-link`, { amount, memo }, { headers: this.headers });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    public async getBalance(): Promise<ApiResponse<Balance>> {
        try {
            const response = await axios.get(`${this.baseURL}/rest/v1/balance`, { headers: this.headers });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

}

export default RemesitaAPI;
