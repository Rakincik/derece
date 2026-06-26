import { NextResponse } from 'next/server';
import { queryBIN, queryInstallmentRates, getNormalizedBrandName } from '@/lib/paramPos';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const bin = searchParams.get('bin');
    const amountStr = searchParams.get('amount') || '0';
    const amount = parseFloat(amountStr);

    if (!bin || bin.length < 6) {
      return NextResponse.json(
        { error: 'Geçersiz kart BIN numarası.' },
        { status: 400 }
      );
    }

    // Call Param POS to get BIN Details
    const { brand, isCredit, bankName } = await queryBIN(bin.substring(0, 6));
    
    // Call Param POS to get special installment rates
    const rates = await queryInstallmentRates();

    const normalizedBrand = getNormalizedBrandName(brand);
    
    // Find rates matching this normalized brand
    let bankRates = rates.find(r => r.bankName.toLowerCase().trim() === normalizedBrand.toLowerCase().trim());
    
    // Fallback to "Diğer Banka Kartları" if no brand specific rate is found
    if (!bankRates) {
      bankRates = rates.find(r => r.bankName.includes('Diğer Banka Kartları'));
    }

    const installments = [];
    
    if (bankRates && bankRates.installments) {
      // BDDK Turkish banking regulations: Debit cards cannot have installments
      if (isCredit) {
        Object.entries(bankRates.installments).forEach(([countStr, rate]) => {
          const count = parseInt(countStr, 10);
          // Negative commission rates indicate that installment is disabled
          if (rate >= 0) {
            const totalAmount = amount + (amount * rate) / 100;
            const monthlyPayment = totalAmount / count;
            
            installments.push({
              count,
              rate,
              monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
              total: parseFloat(totalAmount.toFixed(2))
            });
          }
        });
      } else {
        // Debit card only gets single payment option
        const rate = bankRates.installments[1] || 0;
        const totalAmount = amount + (amount * rate) / 100;
        installments.push({
          count: 1,
          rate,
          monthlyPayment: parseFloat(totalAmount.toFixed(2)),
          total: parseFloat(totalAmount.toFixed(2))
        });
      }
    } else {
      // Standard single-shot fallback
      installments.push({
        count: 1,
        rate: 0,
        monthlyPayment: amount,
        total: amount
      });
    }

    // Sort by installment count
    installments.sort((a, b) => a.count - b.count);

    return NextResponse.json({
      brand: brand || 'Diğer',
      isCredit,
      bankName,
      installments
    });

  } catch (error) {
    console.error('Installment query error:', error);
    return NextResponse.json(
      { error: 'Taksit seçenekleri sorgulanırken hata oluştu.' },
      { status: 500 }
    );
  }
}
