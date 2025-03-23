import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const financingApi = axios.create({
  baseURL: `${BASE_URL}/financing`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FinancingCalculatorParams {
  plan_type: 'programmed' | 'immediate';
  vehicle_price: number;
  down_payment?: number;
  term_months: number;
}

export interface PaymentScheduleItem {
  payment_number: number;
  principal: string;
  principal_raw: number;
  interest: string;
  interest_raw: number;
  total_payment: string;
  total_payment_raw: number;
  remaining_balance: string;
  remaining_balance_raw: number;
  is_adjudication: boolean;
}

export interface CalculatorResult {
  plan_type: 'programmed' | 'immediate';
  vehicle_price: string;
  vehicle_price_raw: number;
  term_months: number;
  monthly_payment: string;
  monthly_payment_raw: number;
  total_interest: string;
  total_interest_raw: number;
  total_amount: string;
  total_amount_raw: number;
  payment_schedule: PaymentScheduleItem[];
  
  // Para compra programada
  adjudication_month?: number;
  adjudication_payment?: string;
  adjudication_payment_raw?: number;
  
  // Para adjudicación inmediata
  down_payment?: string;
  down_payment_raw?: number;
  financed_amount?: string;
  financed_amount_raw?: number;
}

export const calculateFinancing = async (params: FinancingCalculatorParams): Promise<CalculatorResult> => {
  try {
    const response = await financingApi.post('/calculator/v2/', params);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al calcular financiamiento');
    }
    throw new Error('Error de conexión');
  }
};

export const getFinancingPlans = async () => {
  try {
    const response = await financingApi.get('/plans/');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al obtener planes de financiamiento');
    }
    throw new Error('Error de conexión');
  }
};

export const saveSimulation = async (simulationData: any, token: string) => {
  try {
    const response = await financingApi.post('/simulations/', simulationData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Error al guardar simulación');
    }
    throw new Error('Error de conexión');
  }
};

export default {
  calculateFinancing,
  getFinancingPlans,
  saveSimulation,
}; 