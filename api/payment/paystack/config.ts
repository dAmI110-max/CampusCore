export default function handler(req: any, res: any) {
  return res.status(200).json({
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    isLiveConfigured: !!(process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_PUBLIC_KEY),
  });
}
