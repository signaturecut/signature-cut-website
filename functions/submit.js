import { EmailMessage } from "cloudflare:email";

export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    
    const data = {
      name: formData.get('name') || 'N/A',
      email: formData.get('email') || 'N/A',
      company: formData.get('company') || 'N/A',
      phone: formData.get('phone') || 'N/A',
      budget: formData.get('budget') || 'N/A',
      source: formData.get('source') || 'N/A',
      projectDetails: formData.get('project_details') || 'N/A',
      bookCall: formData.get('book_call') ? 'Yes' : 'No',
      date: new Date().toISOString()
    };
    
    const submissionId = `msg_${Date.now()}`;

    // 1. Save to Cloudflare KV Database
    await context.env.CONTACT_FORMS.put(submissionId, JSON.stringify(data));

    // 2. Draft the email for your Gmail inbox
    const emailContent = `
NEW INQUIRY: Signature Cut Studios

CLIENT INFO
Name: ${data.name}
Email: ${data.email}
Company: ${data.company}
Phone: ${data.phone}

PROJECT SCOPE
Budget Level: ${data.budget}
Discovery Call Requested: ${data.bookCall}
Source: ${data.source}

PROJECT DETAILS:
${data.projectDetails}
    `.trim();
    
    // 3. Send the email
    const msg = new EmailMessage(
      "noreply@signaturecutstudios.com",      
      "signaturecutofficial@gmail.com",            
      emailContent
    );
    await context.env.EMAIL_SENDER.send(msg);

    // 4. Return success to the frontend
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: "Server error" }), { status: 500 });
  }
}