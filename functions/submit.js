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

    // 1. Save to Cloudflare KV Database (This still works perfectly!)
    if (context.env.CONTACT_FORMS) {
      await context.env.CONTACT_FORMS.put(submissionId, JSON.stringify(data));
    }

    // 2. Draft the email
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
    
    // 3. Send the email using Web3Forms (Bypassing Cloudflare entirely)
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        access_key: "e4f5e46b-3e22-43d4-ae1b-24ad714de751",
        subject: "New Website Inquiry from " + data.name,
        from_name: "Signature Cut Studios",
        email: data.email, // This makes it so hitting "Reply" emails the client directly!
        message: emailContent
      }),
    });

    // 4. Return success to the frontend
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: err.message || "Unknown Server Error" 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}