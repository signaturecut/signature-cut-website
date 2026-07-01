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

    // 1. Safety Check: Verify Database exists
    if (!context.env.CONTACT_FORMS) {
      throw new Error("Cloudflare can't find the CONTACT_FORMS database. Check wrangler.toml");
    }

    // 2. Save to Cloudflare KV Database
    await context.env.CONTACT_FORMS.put(submissionId, JSON.stringify(data));

    // 3. Draft the email
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
    
    // 4. Safety Check: Verify Email Sender exists
    if (!context.env.EMAIL_SENDER) {
      throw new Error("Cloudflare can't find the EMAIL_SENDER binding. Check wrangler.toml");
    }

    // 5. Send the email (Using the new 2026 Cloudflare API Syntax)
    await context.env.EMAIL_SENDER.send({
      from: "noreply@signaturecutstudios.com",      
      to: "signaturecutofficial@gmail.com",            
      subject: "NEW INQUIRY: Signature Cut Studios",
      text: emailContent
    });

    // 6. Return success to the frontend
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    // This will now catch the EXACT error and send it back to us!
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message || "Unknown Server Error" 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}