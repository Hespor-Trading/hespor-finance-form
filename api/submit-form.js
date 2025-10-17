/**
 * Vercel serverless handler for lead submissions.
 * - Validates required fields
 * - Applies simple eligibility rule (revenue >= 500000)
 * - TODO: integrate email/CRM (HubSpot/Sheets/SMTP) as needed
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success:false, message:'Method not allowed' });
  }

  try {
    const { name, email, phone, company, revenue, message, consent } = req.body || {};

    if (!name || !email || !company || typeof revenue !== 'number') {
      return res.status(400).json({ success:false, message:'Missing required fields' });
    }

    // Very light sanitization
    const clean = (v) => String(v || '').toString().slice(0, 2000);

    const payload = {
      name: clean(name),
      email: clean(email),
      phone: clean(phone),
      company: clean(company),
      revenue: Number(revenue) || 0,
      message: clean(message),
      consent: !!consent,
      ts: new Date().toISOString(),
      ua: req.headers['user-agent'] || ''
    };

    // —— Eligibility rule
    const eligible = payload.revenue >= 500000;

    // TODO: Persist somewhere (Google Sheet, Supabase, Airtable, email, etc.)
    // For now, just log so you can see submissions in Vercel logs:
    console.log('Lead:', payload);

    return res.status(200).json({ success:true, eligible });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success:false, message:'Server error' });
  }
}
