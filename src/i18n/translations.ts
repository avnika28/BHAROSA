export type LanguageCode = 'en' | 'hi' | 'hinglish';

export interface FaqItem {
  q: string;
  a: string;
}

export const TRANSLATIONS = {
  en: {
    // Core required keys from specification
    tagline: 'Kaam pura, paisa pura.',
    newProjectHint: 'Tell us about the job in plain words. Ready in 30 seconds.',
    aiWriting: 'Writing your checklist, one second...',
    btnStart: 'Start a project',
    btnPay: 'Pay with PayPal',
    btnSubmitWork: 'Submit work',
    btnRelease: 'Release money',
    btnFixes: 'Ask for fixes',
    held: 'Held, not charged',
    statusFunded: 'Money is safe. You can start the work.',
    statusPaid: 'Paid. Thank you!',
    navHome: 'Home',
    navNew: 'New project',
    navNewShort: 'New',
    navProjects: 'My projects',
    navHow: 'How it works',
    navHelp: 'Help',

    // Stickers, small links, buttons & banners
    noLoginSticker: 'Zero payment risk!',
    simpleSticker: 'Simple & clear!',
    safeEscrowSticker: '100% safe escrow',
    whatsThisLabel: "what's this?",
    btnGotIt: 'Got it',
    btnOkay: 'Okay',
    toastAiBusyChecklist:
      'AI is busy, we added a standard checklist. You can edit it.',
    toastAiBusyReview:
      'AI is busy, we applied a standard checklist check. You can edit it.',
    errDescribeJobFirst: 'Please describe the job first',
    errLoadProject: 'Could not load project.',
    errFindProjectLink: 'Could not find that project link.',
    errStartDemo: 'Could not start demo project.',
    errSaveProject: 'Failed to save project.',
    errReleasePayment: 'Could not release payment.',
    errFixRequest: 'Could not send fix request.',
    errCancelHold: 'Could not cancel hold.',

    // Top guidance lines
    topLineHome:
      'Start a project in 30 seconds or try the sample project right now.',
    topLineNewProjectChecklist:
      'Review the checklist points AI will check when you submit your work.',
    topLineNewProjectShare:
      'Send the client link on WhatsApp so your client can hold the money on PayPal.',
    topLineMyProjects: 'Select any project below to open its current step.',
    topLineHowItWorks:
      'Three simple steps: hold the money, check the work, release the payment.',
    topLineHelp:
      'Tap any question below for a simple answer, or chat with us on WhatsApp.',

    // Home screen
    taglineSubtitle:
      'Your client holds the money safely on PayPal before you start. AI checks the delivered work against the checklist, then your money is released immediately.',
    tryDemoBtn: 'Try sample project ($200 logo)',
    stepOneBadge: 'Step one',
    stepTwoBadge: 'Step two',
    stepThreeBadge: 'Step three',
    step1Title: '1. Hold money',
    step1Desc:
      'Your client holds the money in USD on PayPal before you start working.',
    step2Title: '2. Check work',
    step2Desc:
      'Upload your finished files. AI checks every point on the checklist.',
    step3Title: '3. Release pay',
    step3Desc:
      'Your client confirms with one click and your full payment is released.',

    // How it works screen
    howHeadline: 'How it works',
    howStep1Title: '1. Hold',
    howStep1Line:
      'Your client authorizes the payment in USD on PayPal — the money is held safely, not charged yet.',
    howStep2Title: '2. Check',
    howStep2Line:
      'You upload your files or link, and AI checks every deliverable against the agreed checklist.',
    howStep3Title: '3. Release',
    howStep3Line:
      'Your client confirms with one click and PayPal captures the money directly to you.',

    // Help screen
    helpHeadline: 'Help & FAQs',
    chatOnWhatsappBtn: 'Chat on WhatsApp',
    whatsappHelpPrefill:
      'Hi team, I have a question about using the escrow app for my freelance project.',

    // My projects screen
    myProjectsHeadline: 'My projects',
    noProjectsYet: 'No projects yet.',
    startFirstOneBtn: 'Start your first one',
    projectIdPrefix: 'ID:',

    // New project screen
    newProjectHeadline: "What's the job?",
    pickTemplateLabel: 'Pick a quick template or write your own below',
    describeWorkLabel: 'Describe the work',
    describeWorkPlaceholder:
      'e.g., Logo design for a college fest, 3 logo concepts, PNG + SVG, 2 revisions',
    amountLabel: 'Amount in USD',
    freelancerGetsLabel: 'You receive approx.',
    deadlineLabel: 'Deadline',
    freelancerNameLabel: 'Your name (Freelancer)',
    freelancerNamePlaceholder: 'e.g., Priya Sharma',
    clientNameLabel: "Client's name",
    clientNamePlaceholder: 'e.g., Alex Rivera',
    continueBtn: 'Continue',
    checklistHeadline: 'Simple checklist',
    checklistSubtitle:
      'AI will check these exact points when you submit your work. Click any line to edit.',
    addPointPlaceholder: 'Add another checklist point...',
    addPointBtn: 'Add point',
    looksGoodBtn: 'Looks good',
    savingProjectBtn: 'Creating magic links...',

    // Share magic links screen
    shareHeadline: 'Project ready. Send to client.',
    shareSubtitle:
      'Send the client link on WhatsApp so they can hold the money safely on PayPal.',
    shareWhatsappBtn: 'Share on WhatsApp',
    copyClientLinkBtn: 'Copy client link',
    copiedLabel: 'Copied!',
    openFreelancerLinkBtn: 'Open freelancer view',
    openClientLinkBtn: 'Open project & pay now',
    yourPrivateLinkLabel: 'Your private freelancer link (saved in this browser)',
    clientMagicLinkLabel: 'Client magic link (send this to your client)',

    // Project page (Pay - Work - Check - Done)
    stepPay: 'Pay',
    stepWork: 'Work',
    stepCheck: 'Check',
    stepDone: 'Done',
    statusLinePayClient:
      'Hold the money on PayPal so the freelancer can start working.',
    statusLinePayFreelancer:
      'Waiting for your client to hold the money on PayPal.',
    statusLineWorkClient:
      'Your money is safely held (not charged yet). The freelancer is working now.',
    statusLineCheckClient:
      'AI checked the delivered work. Review the result below and release the payment.',
    statusLineCheckFreelancer:
      'AI checked your work. Waiting for the client to confirm and release your payment.',

    // Tooltips
    tooltipUsdInr:
      'Your client pays in USD via PayPal. We show the Rupee (₹) value at $1 = ₹84.5 for easy reference.',
    tooltipHeldNotCharged:
      'PayPal reserves the money on the client’s card without charging it until the work is delivered and confirmed.',
    tooltipReleaseCalc:
      'Calculated automatically from Passed ÷ (Passed + Failed) checklist items. Subjective items are decided by the client.',
    tooltipAutoRelease:
      'If the client does not respond for 3 days after work is checked, the payment becomes eligible for auto-release.',

    // Step PAY
    securedByPaypal:
      'Secured by PayPal · Money stays on hold until the work is done',
    waitingForClientPay: 'Waiting for your client to pay?',
    reshareWhatsappBtn: 'Share link on WhatsApp',
    authorizingHoldBtn: 'Holding money on PayPal...',
    authExpiryWarning:
      'This PayPal hold is older than 29 days and has expired. Please re-authorize the hold.',
    reauthorizeBtn: 'Re-authorize PayPal hold',
    sandboxHoldBadge: 'Sandbox hold',
    orderIdLabel: 'Order ID:',
    heldModalTag: 'Held safely, not charged until work is done',
    sandboxBuyerEmailLabel: 'Sandbox buyer email',
    approveHoldModalBtn: 'Approve hold now',
    cancelAndBackBtn: 'Cancel and go back',
    paypalLoading: 'Loading secure PayPal checkout...',
    paypalSdkFailed: 'PayPal could not load. Check your internet and refresh.',
    paypalNotConfigured: 'Payments are not set up on this server yet.',
    paypalNoClientId: 'PayPal Client ID is missing on the server.',
    paypalDemoTag: 'Demo, not real PayPal',
    paypalNotConfiguredHint:
      'Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in the app secrets, then restart.',
    paypalOffline: 'Cannot reach the payment server.',
    paypalOfflineHint:
      'The backend (server.ts) must be running. Static hosting cannot run it.',
    paypalRetryBtn: 'Retry',

    // Step WORK
    dropWorkHeadline: 'Drop your work here',
    dropWorkSub: 'Click or drag PDF, DOCX, TXT, PNG, SVG, or JPG files',
    filesReadySuffix: 'files ready:',
    pasteLinkLabel: 'Or paste a work link (Google Drive, Figma, GitHub)',
    optionalNoteLabel: 'Optional note for your client',
    optionalNotePlaceholder: 'Write a short note about your delivered work...',
    submittingWorkBtn: 'AI is checking your work, one second...',
    demoSampleCompleteBtn: 'Load sample 1: Complete work (100% pass)',
    demoSampleIncompleteBtn: 'Load sample 2: Missing SVG file (80% pass)',
    fixRequestedBanner: 'Client asked for fixes:',

    // Step CHECK
    passWord: 'Pass',
    failWord: 'Fail',
    askHumanWord: 'Ask human',
    defaultCheckedReason: 'Checked against submitted files.',
    toggleStatusHint: 'Click to toggle Pass / Fail',
    verdictReadyBadge: 'Checklist review ready!',
    releaseBoxTitle: 'Release',
    releasingMoneyBtn: 'Releasing payment...',
    maxRevisionsReached: 'All 2 revision rounds used',
    fixInputPlaceholder: 'Write what needs to be fixed...',
    sendToFreelancerBtn: 'Send to freelancer',
    autoReleaseNote:
      'If the client does nothing for 3 days, payment becomes eligible for auto-release.',
    somethingWrongLink: 'Something wrong?',
    disputeTitle: 'Tell us what happened (neutral 5-line settlement)',
    freelancerSideLabel: "Freelancer's side",
    freelancerSidePlaceholder: 'Freelancer explains what was delivered...',
    clientSideLabel: "Client's side",
    clientSidePlaceholder: 'Client explains what is missing...',
    getAiDisputeSummaryBtn: 'Get 5-line AI summary',
    writingSummaryBtn: 'Writing summary...',
    voidAndCancelBtn: 'Cancel & return 100% to client',

    // Confirmation modal
    confirmModalTitle: 'Confirm payment release?',
    confirmModalToFreelancer: 'straight to the freelancer',
    confirmModalDesc:
      'This captures the held money on PayPal and sends it to the freelancer immediately. Any remaining hold is returned to you.',
    confirmReleaseYesBtn: 'Yes, release money now',
    confirmReleaseBackBtn: 'Go back',

    // Step DONE
    paidHeadline: 'Paid',
    voidedHeadline: 'Hold cancelled.',
    rateLabel: 'Rate:',
    paypalCaptureIdLabel: 'PayPal Capture ID:',
    downloadReceiptBtn: 'Download receipt (PDF)',
    shareReceiptWhatsappBtn: 'Share receipt on WhatsApp',

    // Role switcher & footer
    viewingAsClient: 'Client view',
    viewingAsFreelancer: 'Freelancer view',
    switchRoleToTest: 'Viewing as:',
    footerEscrowPoweredBy: 'Escrow powered by',

    // Demo Login Screen & Role Session
    welcomeHeadline: 'Welcome to BHAROSA',
    loginBtn: 'Log in',
    logoutBtn: 'Log out',
    roleFreelancerTitle: "I'm a Freelancer",
    roleFreelancerDesc: 'I do the work and get paid.',
    roleClientTitle: "I'm a Client",
    roleClientDesc: 'I pay and approve the work.',
    roleDiffHint:
      'Freelancer creates projects and delivers work. Client pays and releases money.',
    whatsTheDiffLabel: 'What is the difference?',
    nameLabel: 'Name',
    namePlaceholder: 'e.g., Priya Sharma',
    emailLabel: 'Email',
    emailPlaceholder: 'e.g., priya@example.com',
    demoLoginNoPassword: 'Demo login. No password needed.',
    skipTryDemoLink: 'Skip, try the demo',
    errEnterNameEmail: 'Please enter your name and a valid email.',
    roleTagFreelancer: 'FREELANCER',
    roleTagClient: 'CLIENT',
    gotLinkFromFreelancer: 'Got a link from your freelancer?',
  },

  hi: {
    // Core required keys from specification (100% Devanagari, tagline kept in Hinglish)
    tagline: 'Kaam pura, paisa pura.',
    newProjectHint: 'पहले बताइए, काम क्या है? 30 सेकंड में तैयार।',
    aiWriting: 'चेकलिस्ट बन रही है, एक सेकंड...',
    btnStart: 'प्रोजेक्ट शुरू करें',
    btnPay: 'PayPal से पेमेंट करें',
    btnSubmitWork: 'काम जमा करें',
    btnRelease: 'पैसा रिलीज़ करें',
    btnFixes: 'सुधार मांगें',
    held: 'रोका गया, कटा नहीं',
    statusFunded: 'पैसा सुरक्षित है। अब काम शुरू करें।',
    statusPaid: 'भुगतान हो गया। धन्यवाद!',
    navHome: 'होम',
    navNew: 'नया प्रोजेक्ट',
    navNewShort: 'नया',
    navProjects: 'मेरे प्रोजेक्ट्स',
    navHow: 'कैसे काम करता है',
    navHelp: 'मदद',

    // Stickers, small links, buttons & banners
    noLoginSticker: '100% सुरक्षित पेमेंट!',
    simpleSticker: 'सरल और स्पष्ट!',
    safeEscrowSticker: '100% सुरक्षित एस्क्रो',
    whatsThisLabel: 'यह क्या है?',
    btnGotIt: 'समझ गया',
    btnOkay: 'ठीक है',
    toastAiBusyChecklist:
      'AI अभी व्यस्त है, हमने एक मानक चेकलिस्ट जोड़ दी है। आप इसे बदल सकते हैं।',
    toastAiBusyReview:
      'AI अभी व्यस्त है, हमने मानक जांच लागू कर दी है। आप नीचे किसी भी पॉइंट को बदल सकते हैं।',
    errDescribeJobFirst: 'कृपया पहले काम का विवरण लिखें',
    errLoadProject: 'प्रोजेक्ट लोड नहीं हो सका।',
    errFindProjectLink: 'वह प्रोजेक्ट लिंक नहीं मिला।',
    errStartDemo: 'डेमो प्रोजेक्ट शुरू नहीं हो सका।',
    errSaveProject: 'प्रोजेक्ट सेव करने में समस्या हुई।',
    errReleasePayment: 'भुगतान रिलीज़ नहीं हो सका।',
    errFixRequest: 'सुधार का अनुरोध नहीं भेजा जा सका।',
    errCancelHold: 'होल्ड रद्द नहीं हो सका।',

    // Top guidance lines
    topLineHome:
      '30 सेकंड में नया प्रोजेक्ट शुरू करें या अभी सैंपल प्रोजेक्ट चला कर देखें।',
    topLineNewProjectChecklist:
      'इन पॉइंट्स को देखें — जब आप काम जमा करेंगे तब AI इन्हीं की जांच करेगा।',
    topLineNewProjectShare:
      'यह लिंक WhatsApp पर क्लाइंट को भेजें ताकि वे PayPal पर पैसा सुरक्षित रोक सकें।',
    topLineMyProjects: 'किसी भी प्रोजेक्ट के वर्तमान चरण को खोलने के लिए उस पर टैप करें।',
    topLineHowItWorks:
      'तीन सरल चरण: पैसा रोकें, काम जांचें, भुगतान रिलीज़ करें।',
    topLineHelp:
      'आसान जवाब के लिए नीचे किसी भी सवाल पर टैप करें, या WhatsApp पर हमसे बात करें।',

    // Home screen
    taglineSubtitle:
      'काम शुरू होने से पहले क्लाइंट PayPal पर पैसा सुरक्षित रखता है। AI चेकलिस्ट के अनुसार आपके काम की जांच करता है, फिर तुरंत पैसा रिलीज़ हो जाता है।',
    tryDemoBtn: 'सैंपल प्रोजेक्ट देखें ($200 लोगो)',
    stepOneBadge: 'पहला चरण',
    stepTwoBadge: 'दूसरा चरण',
    stepThreeBadge: 'तीसरा चरण',
    step1Title: '1. पैसा सुरक्षित',
    step1Desc:
      'काम शुरू होने से पहले क्लाइंट PayPal पर डॉलर (USD) में राशि रोकता है।',
    step2Title: '2. काम की जांच',
    step2Desc:
      'अपनी तैयार फ़ाइलें अपलोड करें। AI चेकलिस्ट के हर पॉइंट की जांच करेगा।',
    step3Title: '3. पैसा रिलीज़',
    step3Desc:
      'क्लाइंट एक क्लिक से पुष्टि करता है और आपका पूरा भुगतान रिलीज़ हो जाता है।',

    // How it works screen
    howHeadline: 'यह कैसे काम करता है',
    howStep1Title: '1. रोकें',
    howStep1Line:
      'क्लाइंट PayPal पर USD में भुगतान अधिकृत करता है — पैसा सुरक्षित रहता है, अभी कटता नहीं है।',
    howStep2Title: '2. जांचें',
    howStep2Line:
      'फ्रीलांसर अपनी फ़ाइलें या लिंक जमा करता है और AI तय चेकलिस्ट के अनुसार हर पॉइंट की जांच करता है।',
    howStep3Title: '3. रिलीज़ करें',
    howStep3Line:
      'क्लाइंट एक क्लिक से मंज़ूरी देता है और PayPal तुरंत पैसा फ्रीलांसर को भेज देता है।',

    // Help screen
    helpHeadline: 'मदद और सामान्य सवाल',
    chatOnWhatsappBtn: 'WhatsApp पर बात करें',
    whatsappHelpPrefill:
      'नमस्ते, मुझे अपने फ्रीलांस प्रोजेक्ट के लिए भरोसा ऐप के बारे में एक सवाल पूछना है।',

    // My projects screen
    myProjectsHeadline: 'मेरे प्रोजेक्ट्स',
    noProjectsYet: 'अभी कोई प्रोजेक्ट नहीं है।',
    startFirstOneBtn: 'अपना पहला प्रोजेक्ट शुरू करें',
    projectIdPrefix: 'आईडी:',

    // New project screen
    newProjectHeadline: 'काम क्या है?',
    pickTemplateLabel: 'ऊपर से एक टेम्पलेट चुनें या नीचे अपने शब्दों में लिखें',
    describeWorkLabel: 'काम का विवरण लिखें',
    describeWorkPlaceholder:
      'उदाहरण: कॉलेज फेस्ट के लिए लोगो डिज़ाइन, 3 लोगो कॉन्सेप्ट, PNG और SVG, 2 रिवीजन',
    amountLabel: 'राशि (USD में)',
    freelancerGetsLabel: 'आपको मिलेंगे लगभग',
    deadlineLabel: 'अंतिम तारीख',
    freelancerNameLabel: 'आपका नाम (फ्रीलांसर)',
    freelancerNamePlaceholder: 'उदाहरण: प्रिया शर्मा',
    clientNameLabel: 'क्लाइंट का नाम',
    clientNamePlaceholder: 'उदाहरण: Alex Rivera',
    continueBtn: 'आगे बढ़ें',
    checklistHeadline: 'सरल चेकलिस्ट',
    checklistSubtitle:
      'जब आप काम जमा करेंगे तब AI इन्हीं पॉइंट्स की जांच करेगा। बदलने के लिए किसी भी लाइन पर टैप करें।',
    addPointPlaceholder: 'एक और पॉइंट जोड़ें...',
    addPointBtn: 'जोड़ें',
    looksGoodBtn: 'सब ठीक है, आगे बढ़ें',
    savingProjectBtn: 'लिंक बन रहे हैं...',

    // Share magic links screen
    shareHeadline: 'प्रोजेक्ट तैयार है। क्लाइंट को भेजें।',
    shareSubtitle:
      'क्लाइंट को WhatsApp पर यह लिंक भेजें ताकि वे PayPal पर पैसा सुरक्षित रोक सकें।',
    shareWhatsappBtn: 'WhatsApp पर भेजें',
    copyClientLinkBtn: 'क्लाइंट लिंक कॉपी करें',
    copiedLabel: 'कॉपी हो गया!',
    openFreelancerLinkBtn: 'फ्रीलांसर व्यू खोलें',
    openClientLinkBtn: 'प्रोजेक्ट खोलें और पेमेंट करें',
    yourPrivateLinkLabel: 'आपका निजी फ्रीलांसर लिंक (इस ब्राउज़र में सेव है)',
    clientMagicLinkLabel: 'क्लाइंट का लिंक (यह क्लाइंट को भेजें)',

    // Project page (Pay - Work - Check - Done)
    stepPay: 'पेमेंट',
    stepWork: 'काम',
    stepCheck: 'जांच',
    stepDone: 'पूरा',
    statusLinePayClient:
      'PayPal पर पैसा सुरक्षित रोकें ताकि फ्रीलांसर काम शुरू कर सके।',
    statusLinePayFreelancer:
      'क्लाइंट द्वारा PayPal पर पैसा रोकने का इंतज़ार है।',
    statusLineWorkClient:
      'आपका पैसा सुरक्षित रोका गया है (अभी कटा नहीं है)। फ्रीलांसर काम कर रहा है।',
    statusLineCheckClient:
      'AI ने काम की जांच कर ली है। नीचे परिणाम देखें और भुगतान रिलीज़ करें।',
    statusLineCheckFreelancer:
      'AI ने आपके काम की जांच कर ली है। क्लाइंट की पुष्टि का इंतज़ार है।',

    // Tooltips
    tooltipUsdInr:
      'क्लाइंट PayPal पर डॉलर (USD) में भुगतान करता है। आपकी सुविधा के लिए $1 = ₹84.5 के हिसाब से रुपये दिखाए गए हैं।',
    tooltipHeldNotCharged:
      'PayPal क्लाइंट के कार्ड पर राशि रिज़र्व कर देता है, लेकिन काम पूरा होने तक उसे काटता नहीं है।',
    tooltipReleaseCalc:
      'यह राशि पास हुए चेकलिस्ट पॉइंट्स के अनुपात से अपने आप निकाली जाती है।',
    tooltipAutoRelease:
      'यदि काम की जांच के 3 दिन बाद तक क्लाइंट कोई जवाब नहीं देता, तो भुगतान ऑटो-रिलीज़ के लिए तैयार हो जाता है।',

    // Step PAY
    securedByPaypal:
      'PayPal द्वारा सुरक्षित · काम पूरा होने तक पैसा होल्ड पर रहता है',
    waitingForClientPay: 'क्लाइंट के भुगतान का इंतज़ार है?',
    reshareWhatsappBtn: 'WhatsApp पर लिंक भेजें',
    authorizingHoldBtn: 'PayPal पर पैसा रोका जा रहा है...',
    authExpiryWarning:
      'PayPal होल्ड को 29 दिन से अधिक हो गए हैं। कृपया दोबारा अधिकृत करें।',
    reauthorizeBtn: 'दोबारा होल्ड करें',
    sandboxHoldBadge: 'सैंडबॉक्स होल्ड',
    orderIdLabel: 'ऑर्डर आईडी:',
    heldModalTag: 'सुरक्षित रोका गया, काम पूरा होने तक कटेगा नहीं',
    sandboxBuyerEmailLabel: 'सैंडबॉक्स खरीदार ईमेल',
    approveHoldModalBtn: 'अभी होल्ड मंज़ूर करें',
    cancelAndBackBtn: 'रद्द करें और वापस जाएं',
    paypalLoading: 'सुरक्षित PayPal चेकआउट लोड हो रहा है...',
    paypalSdkFailed: 'PayPal लोड नहीं हो पाया। इंटरनेट जाँचें और पेज रीफ़्रेश करें।',
    paypalNotConfigured: 'इस सर्वर पर पेमेंट अभी सेट नहीं है।',
    paypalNoClientId: 'सर्वर पर PayPal Client ID नहीं मिला।',
    paypalDemoTag: 'डेमो, असली PayPal नहीं',
    paypalNotConfiguredHint:
      'ऐप सीक्रेट्स में PAYPAL_CLIENT_ID और PAYPAL_CLIENT_SECRET जोड़ें, फिर रीस्टार्ट करें।',
    paypalOffline: 'पेमेंट सर्वर से संपर्क नहीं हो पा रहा।',
    paypalOfflineHint:
      'बैकएंड (server.ts) चालू होना चाहिए। स्टैटिक होस्टिंग पर यह नहीं चलता।',
    paypalRetryBtn: 'पुनः प्रयास करें',

    // Step WORK
    dropWorkHeadline: 'अपना काम यहाँ डालें',
    dropWorkSub: 'PDF, DOCX, TXT, PNG, SVG, या JPG फ़ाइलें चुनें या ड्रैग करें',
    filesReadySuffix: 'फ़ाइलें तैयार हैं:',
    pasteLinkLabel: 'या काम का लिंक पेस्ट करें (Drive, Figma, GitHub)',
    optionalNoteLabel: 'क्लाइंट के लिए छोटा नोट (वैकल्पिक)',
    optionalNotePlaceholder: 'अपने काम के बारे में एक संक्षिप्त नोट लिखें...',
    submittingWorkBtn: 'AI आपके काम की जांच कर रहा है, एक सेकंड...',
    demoSampleCompleteBtn: 'सैंपल 1: पूरा काम (100% पास)',
    demoSampleIncompleteBtn: 'सैंपल 2: अधूरा काम (80% पास)',
    fixRequestedBanner: 'क्लाइंट ने सुधार मांगे हैं:',

    // Step CHECK
    passWord: 'पास',
    failWord: 'सुधार चाहिए',
    askHumanWord: 'क्लाइंट चुनेगा',
    defaultCheckedReason: 'जमा की गई फ़ाइलों के अनुसार जांचा गया।',
    toggleStatusHint: 'पास / सुधार बदलने के लिए क्लिक करें',
    verdictReadyBadge: 'चेकलिस्ट रिपोर्ट तैयार है!',
    releaseBoxTitle: 'रिलीज़',
    releasingMoneyBtn: 'पैसा रिलीज़ हो रहा है...',
    maxRevisionsReached: 'दोनों रिवीजन राउंड पूरे हो चुके हैं',
    fixInputPlaceholder: 'लिखें कि क्या सुधार चाहिए...',
    sendToFreelancerBtn: 'फ्रीलांसर को भेजें',
    autoReleaseNote:
      'यदि क्लाइंट 3 दिनों तक कुछ नहीं करता है, तो भुगतान ऑटो-रिलीज़ के योग्य हो जाता है।',
    somethingWrongLink: 'कुछ गड़बड़ है?',
    disputeTitle: 'बताइए क्या हुआ (5-लाइन का निष्पक्ष समाधान)',
    freelancerSideLabel: 'फ्रीलांसर का पक्ष',
    freelancerSidePlaceholder: 'फ्रीलांसर बताए कि क्या काम दिया गया...',
    clientSideLabel: 'क्लाइंट का पक्ष',
    clientSidePlaceholder: 'क्लाइंट बताए कि क्या कमी है...',
    getAiDisputeSummaryBtn: '5-लाइन का AI सारांश लें',
    writingSummaryBtn: 'सारांश लिखा जा रहा है...',
    voidAndCancelBtn: 'रद्द करें और 100% क्लाइंट को लौटाएं',

    // Confirmation modal
    confirmModalTitle: 'क्या भुगतान रिलीज़ करें?',
    confirmModalToFreelancer: 'सीधे फ्रीलांसर को',
    confirmModalDesc:
      'यह PayPal पर रोके गए पैसे को तुरंत फ्रीलांसर को भेज देगा। बची हुई राशि आपको वापस मिल जाएगी।',
    confirmReleaseYesBtn: 'हाँ, अभी पैसा रिलीज़ करें',
    confirmReleaseBackBtn: 'वापस जाएं',

    // Step DONE
    paidHeadline: 'भुगतान पूरा',
    voidedHeadline: 'होल्ड रद्द किया गया।',
    rateLabel: 'दर:',
    paypalCaptureIdLabel: 'PayPal कैप्चर आईडी:',
    downloadReceiptBtn: 'रसीद डाउनलोड करें (PDF)',
    shareReceiptWhatsappBtn: 'WhatsApp पर रसीद शेयर करें',

    // Role switcher & footer
    viewingAsClient: 'क्लाइंट व्यू',
    viewingAsFreelancer: 'फ्रीलांसर व्यू',
    switchRoleToTest: 'देख रहे हैं:',
    footerEscrowPoweredBy: 'एस्क्रो पार्टनर',

    // Demo Login Screen & Role Session (Devanagari)
    welcomeHeadline: 'BHAROSA में आपका स्वागत है',
    loginBtn: 'लॉग इन',
    logoutBtn: 'लॉग आउट',
    roleFreelancerTitle: 'मैं फ्रीलांसर हूँ',
    roleFreelancerDesc: 'मैं काम करता हूँ और भुगतान पाता हूँ।',
    roleClientTitle: 'मैं क्लाइंट हूँ',
    roleClientDesc: 'मैं भुगतान करता हूँ और काम मंज़ूर करता हूँ।',
    roleDiffHint:
      'फ्रीलांसर प्रोजेक्ट बनाता है और काम जमा करता है। क्लाइंट भुगतान करता है और पैसा रिलीज़ करता है।',
    whatsTheDiffLabel: 'दोनों में क्या अंतर है?',
    nameLabel: 'नाम',
    namePlaceholder: 'उदाहरण: प्रिया शर्मा',
    emailLabel: 'ईमेल',
    emailPlaceholder: 'उदाहरण: priya@example.com',
    demoLoginNoPassword: 'डेमो लॉगिन। पासवर्ड की ज़रूरत नहीं।',
    skipTryDemoLink: 'छोड़ें, डेमो देखें',
    errEnterNameEmail: 'कृपया अपना नाम और सही ईमेल लिखें।',
    roleTagFreelancer: 'FREELANCER',
    roleTagClient: 'CLIENT',
    gotLinkFromFreelancer: 'फ्रीलांसर से लिंक मिला है?',
  },

  hinglish: {
    // Core required keys from specification (Roman Hindi / Hinglish)
    tagline: 'Kaam pura, paisa pura.',
    newProjectHint: 'Pehle batao, kaam kya hai? 30 second mein taiyaar.',
    aiWriting: 'Checklist ban rahi hai, ek second...',
    btnStart: 'Project shuru karo',
    btnPay: 'PayPal se pay karo',
    btnSubmitWork: 'Kaam bhejo',
    btnRelease: 'Paisa release karo',
    btnFixes: 'Fix karwao',
    held: 'Roka hai, kata nahi',
    statusFunded: 'Paisa safe hai. Ab kaam shuru karo.',
    statusPaid: 'Paisa mil gaya. Shukriya!',
    navHome: 'Home',
    navNew: 'Naya project',
    navNewShort: 'Naya',
    navProjects: 'Mere projects',
    navHow: 'Kaise kaam karta hai',
    navHelp: 'Madad',

    // Stickers, small links, buttons & banners
    noLoginSticker: 'Paisa 100% safe!',
    simpleSticker: 'Seedha aur simple!',
    safeEscrowSticker: '100% safe escrow',
    whatsThisLabel: 'yeh kya hai?',
    btnGotIt: 'Samajh gaya',
    btnOkay: 'Theek hai',
    toastAiBusyChecklist:
      'AI abhi busy hai, humne standard checklist laga di hai. Aap isse edit kar sakte ho.',
    toastAiBusyReview:
      'AI abhi busy hai, humne standard check laga diya hai. Aap neeche edit kar sakte ho.',
    errDescribeJobFirst: 'Pehle batao kaam kya hai',
    errLoadProject: 'Project load nahi ho paya.',
    errFindProjectLink: 'Woh project link nahi mila.',
    errStartDemo: 'Demo project shuru nahi ho paya.',
    errSaveProject: 'Project save nahi ho paya.',
    errReleasePayment: 'Paisa release nahi ho paya.',
    errFixRequest: 'Fix request nahi bhej paye.',
    errCancelHold: 'Hold cancel nahi ho paya.',

    // Top guidance lines
    topLineHome:
      '30 second mein project shuru karo ya sample project chala kar abhi dekh lo.',
    topLineNewProjectChecklist:
      'Yeh rahi aapki simple checklist — kaam bhejne par AI yehi points check karega.',
    topLineNewProjectShare:
      'Ab client ko WhatsApp par yeh link bhejo taaki woh PayPal par paisa rok sake.',
    topLineMyProjects: 'Kisi bhi project par tap karke uska current step kholo.',
    topLineHowItWorks:
      'Teen seedhe steps: paisa roko, kaam check karo, paisa release karo.',
    topLineHelp:
      'Koi sawal hai? Neeche tap karke aasaan jawab padho, ya WhatsApp par baat karo.',

    // Home screen
    taglineSubtitle:
      'Kaam shuru hone se pehle client PayPal par paisa safe rokta hai. AI checklist ke hisaab se kaam check karta hai, phir paisa turant release ho jata hai.',
    tryDemoBtn: 'Sample project dekho ($200 logo)',
    stepOneBadge: 'Pehla step',
    stepTwoBadge: 'Doosra step',
    stepThreeBadge: 'Teesra step',
    step1Title: '1. Paisa safe',
    step1Desc:
      'Kaam shuru hone se pehle client PayPal par USD rok kar rakhta hai.',
    step2Title: '2. Kaam check',
    step2Desc:
      'Apni files upload karo. AI checklist ka har point check karega.',
    step3Title: '3. Paisa release',
    step3Desc:
      'Client ke ek click par aapka pura paisa turant release ho jata hai.',

    // How it works screen
    howHeadline: 'Kaise kaam karta hai',
    howStep1Title: '1. Roko',
    howStep1Line:
      'Client PayPal par USD mein payment authorize karta hai — paisa safe rehta hai, abhi kat-ta nahi hai.',
    howStep2Title: '2. Check karo',
    howStep2Line:
      'Freelancer apna kaam upload karta hai aur AI checklist ke har point se usko milata hai.',
    howStep3Title: '3. Release karo',
    howStep3Line:
      'Client ek click mein confirm karta hai aur PayPal turant paisa freelancer ko bhej deta hai.',

    // Help screen
    helpHeadline: 'Madad aur FAQs',
    chatOnWhatsappBtn: 'WhatsApp par baat karo',
    whatsappHelpPrefill:
      'Hi Bharosa team, mujhe apne freelance project ke liye ek sawal poochna hai.',

    // My projects screen
    myProjectsHeadline: 'Mere projects',
    noProjectsYet: 'Abhi koi project nahi hai.',
    startFirstOneBtn: 'Apna pehla project shuru karo',
    projectIdPrefix: 'ID:',

    // New project screen
    newProjectHeadline: 'Kaam kya hai?',
    pickTemplateLabel: 'Ek quick template chuno ya neeche apne shabdon mein likho',
    describeWorkLabel: 'Kaam ke baare mein batao',
    describeWorkPlaceholder:
      'Jaise: College fest ke liye logo design, 3 logo concepts, PNG + SVG, 2 revisions',
    amountLabel: 'Kitna paisa (USD mein)',
    freelancerGetsLabel: 'Aapko milega lagbhag',
    deadlineLabel: 'Kab tak dena hai?',
    freelancerNameLabel: 'Aapka naam (Freelancer)',
    freelancerNamePlaceholder: 'Jaise: Priya Sharma',
    clientNameLabel: 'Client ka naam',
    clientNamePlaceholder: 'Jaise: Alex Rivera',
    continueBtn: 'Aage badho',
    checklistHeadline: 'Simple checklist',
    checklistSubtitle:
      'Jab aap kaam bhejoge tab AI yehi points check karega. Edit karne ke liye kisi bhi line par tap karo.',
    addPointPlaceholder: 'Koi aur point jodna hai? Yahan likho...',
    addPointBtn: 'Jodo',
    looksGoodBtn: 'Badiya hai, aage badho',
    savingProjectBtn: 'Magic links ban rahe hain...',

    // Share magic links screen
    shareHeadline: 'Project taiyaar! Client ko bhejo.',
    shareSubtitle:
      'Client ko WhatsApp par yeh link bhejo taaki woh PayPal par paisa safe rok sake.',
    shareWhatsappBtn: 'WhatsApp par bhejo',
    copyClientLinkBtn: 'Client link copy karo',
    copiedLabel: 'Copy ho gaya!',
    openFreelancerLinkBtn: 'Freelancer view kholo',
    openClientLinkBtn: 'Project kholo & pay karo',
    yourPrivateLinkLabel: 'Aapka apna link (is browser mein save hai)',
    clientMagicLinkLabel: 'Client ka link (yeh client ko WhatsApp karo)',

    // Project page (Pay - Work - Check - Done)
    stepPay: 'Pay',
    stepWork: 'Kaam',
    stepCheck: 'Check',
    stepDone: 'Pura',
    statusLinePayClient:
      'PayPal par paisa rok kar safe karo taaki freelancer kaam shuru kare.',
    statusLinePayFreelancer:
      'Client ke PayPal par paisa rokne ka wait ho raha hai.',
    statusLineWorkClient:
      'Aapka paisa safe roka gaya hai (abhi kata nahi hai). Freelancer kaam kar raha hai.',
    statusLineCheckClient:
      'AI ne kaam check kar liya hai. Neeche result dekho aur paisa release karo.',
    statusLineCheckFreelancer:
      'AI ne aapka kaam check kar liya hai. Bas client ke release karne ka wait hai.',

    // Tooltips
    tooltipUsdInr:
      'Client PayPal par USD mein pay karta hai. Aapki aasaani ke liye $1 = ₹84.5 ke hisaab se Rupee dikhaya gaya hai.',
    tooltipHeldNotCharged:
      'PayPal client ke card par paisa lock kar deta hai, par kaam pura hone tak kat-ta nahi hai.',
    tooltipReleaseCalc:
      'Yeh hisaab Passed ÷ (Passed + Failed) checklist points se apne aap nikalta hai.',
    tooltipAutoRelease:
      'Agar kaam check hone ke baad client 3 din tak kuch nahi karta, toh payment auto-release ke liye ready ho jata hai.',

    // Step PAY
    securedByPaypal:
      'Secured by PayPal · Kaam pura hone tak paisa safe rehta hai',
    waitingForClientPay: 'Client ne abhi tak pay nahi kiya?',
    reshareWhatsappBtn: 'WhatsApp par link bhejo',
    authorizingHoldBtn: 'PayPal par paisa roka ja raha hai...',
    authExpiryWarning:
      'PayPal hold ko 29 din se zyada ho gaye hain. Dobara authorize karo.',
    reauthorizeBtn: 'Dobara PayPal hold karo',
    sandboxHoldBadge: 'Sandbox hold',
    orderIdLabel: 'Order ID:',
    heldModalTag: 'Roka hai, kaam pura hone tak katega nahi',
    sandboxBuyerEmailLabel: 'Sandbox buyer email',
    approveHoldModalBtn: 'Abhi hold approve karo',
    cancelAndBackBtn: 'Cancel karo aur wapas jao',
    paypalLoading: 'Secure PayPal checkout load ho raha hai...',
    paypalSdkFailed: 'PayPal load nahi hua. Internet check karo aur page refresh karo.',
    paypalNotConfigured: 'Is server par payment abhi set nahi hai.',
    paypalNoClientId: 'Server par PayPal Client ID nahi mila.',
    paypalDemoTag: 'Demo, asli PayPal nahi',
    paypalNotConfiguredHint:
      'App secrets mein PAYPAL_CLIENT_ID aur PAYPAL_CLIENT_SECRET daalo, phir restart karo.',
    paypalOffline: 'Payment server se connect nahi ho raha.',
    paypalOfflineHint:
      'Backend (server.ts) chalu hona chahiye. Static hosting par ye nahi chalta.',
    paypalRetryBtn: 'Dobara try karo',

    // Step WORK
    dropWorkHeadline: 'Apna kaam yahan daalo',
    dropWorkSub: 'PDF, DOCX, TXT, PNG, SVG, ya JPG files click ya drag karo',
    filesReadySuffix: 'files taiyaar hain:',
    pasteLinkLabel: 'Ya kaam ka link paste karo (Drive, Figma, GitHub)',
    optionalNoteLabel: 'Client ke liye chhota note (optional)',
    optionalNotePlaceholder: 'Apne kaam ke baare mein ek line likho...',
    submittingWorkBtn: 'AI aapka kaam check kar raha hai, ek second...',
    demoSampleCompleteBtn: 'Sample 1: Pura kaam (100% pass)',
    demoSampleIncompleteBtn: 'Sample 2: Adhura kaam (80% pass)',
    fixRequestedBanner: 'Client ne fixes maange hain:',

    // Step CHECK
    passWord: 'Pass',
    failWord: 'Fail',
    askHumanWord: 'Client dekhega',
    defaultCheckedReason: 'Jama ki gayi files ke hisaab se check kiya gaya.',
    toggleStatusHint: 'Pass / Fail badalne ke liye click karo',
    verdictReadyBadge: 'Checklist report taiyaar hai!',
    releaseBoxTitle: 'Release',
    releasingMoneyBtn: 'Paisa release ho raha hai...',
    maxRevisionsReached: 'Dono revision rounds pure ho gaye',
    fixInputPlaceholder: 'Likho kya fix karwana hai...',
    sendToFreelancerBtn: 'Freelancer ko bhejo',
    autoReleaseNote:
      'Agar client 3 din tak kuch nahi karta, toh payment auto-release ke liye ready ho jayega.',
    somethingWrongLink: 'Koi dikkat hai?',
    disputeTitle: 'Batao kya hua (5-line ka neutral faisla)',
    freelancerSideLabel: 'Freelancer ki baat',
    freelancerSidePlaceholder: 'Freelancer bataye kya kaam bheja...',
    clientSideLabel: 'Client ki baat',
    clientSidePlaceholder: 'Client bataye kya kami reh gayi...',
    getAiDisputeSummaryBtn: '5-line AI summary lo',
    writingSummaryBtn: 'Summary ban rahi hai...',
    voidAndCancelBtn: 'Cancel karo & 100% client ko wapas',

    // Confirmation modal
    confirmModalTitle: 'Paisa release kar dein?',
    confirmModalToFreelancer: 'sidha freelancer ko',
    confirmModalDesc:
      'Yeh PayPal par roke gaye paise ko turant freelancer ko bhej dega. Baki bacha hold aapko wapas mil jayega.',
    confirmReleaseYesBtn: 'Haan, paisa release karo',
    confirmReleaseBackBtn: 'Wapas jao',

    // Step DONE
    paidHeadline: 'Paisa mil gaya',
    voidedHeadline: 'Hold cancel ho gaya.',
    rateLabel: 'Rate:',
    paypalCaptureIdLabel: 'PayPal Capture ID:',
    downloadReceiptBtn: 'Receipt download karo (PDF)',
    shareReceiptWhatsappBtn: 'WhatsApp par receipt bhejo',

    // Role switcher & footer
    viewingAsClient: 'Client view',
    viewingAsFreelancer: 'Freelancer view',
    switchRoleToTest: 'Dekh rahe ho:',
    footerEscrowPoweredBy: 'Escrow partner',

    // Demo Login Screen & Role Session (Hinglish)
    welcomeHeadline: 'BHAROSA mein aapka swagat hai',
    loginBtn: 'Log in',
    logoutBtn: 'Log out',
    roleFreelancerTitle: 'Main Freelancer hoon',
    roleFreelancerDesc: 'Main kaam karta hoon aur paisa paata hoon.',
    roleClientTitle: 'Main Client hoon',
    roleClientDesc: 'Main pay karta hoon aur kaam approve karta hoon.',
    roleDiffHint:
      'Freelancer project banata hai aur kaam bhejta hai. Client pay karta hai aur paisa release karta hai.',
    whatsTheDiffLabel: 'Dono mein kya farak hai?',
    nameLabel: 'Naam',
    namePlaceholder: 'Jaise: Priya Sharma',
    emailLabel: 'Email',
    emailPlaceholder: 'Jaise: priya@example.com',
    demoLoginNoPassword: 'Demo login. Password ki zaroorat nahi.',
    skipTryDemoLink: 'Chhodo, demo dekho',
    errEnterNameEmail: 'Apna naam aur sahi email daalo.',
    roleTagFreelancer: 'FREELANCER',
    roleTagClient: 'CLIENT',
    gotLinkFromFreelancer: 'Freelancer se link mila hai?',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS.en;

/**
 * Translate a key into the selected language.
 * Always falls back to English ('en') if a key is missing, NEVER to Hinglish.
 */
export function translateKey(lang: LanguageCode, key: TranslationKey): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const val = (dict as Record<string, string>)[key];
  if (typeof val === 'string' && val.length > 0) {
    return val;
  }
  return TRANSLATIONS.en[key];
}

export function createTranslator(lang: LanguageCode) {
  return (key: TranslationKey): string => translateKey(lang, key);
}

export const FAQS_BY_LANG: Record<LanguageCode, FaqItem[]> = {
  en: [
    {
      q: 'How does Bharosa protect both the freelancer and the client?',
      a: 'Your client locks the payment on PayPal before work starts, and AI checks the delivered files against the agreed checklist before the money is released.',
    },
    {
      q: 'What does "Held, not charged" mean on PayPal?',
      a: 'Your client authorizes the amount on PayPal so the money is locked and guaranteed, but it is only charged once the work is checked and released.',
    },
    {
      q: 'Can the AI release or cancel money on its own?',
      a: 'Never. The AI only checks your uploaded work against the checklist and suggests a payout. Your client always clicks the final button to release the money.',
    },
    {
      q: 'How does USD ($) to Rupee (₹) conversion work?',
      a: 'International clients pay in USD on PayPal, and we show you the live Rupee (₹) value right beside it so you always know what you will earn.',
    },
    {
      q: 'What if the client wants revisions or there is a disagreement?',
      a: 'Your client can click "Ask for fixes" up to 2 times so you can upload updated files, or click "Something wrong?" for a neutral 5-line AI settlement.',
    },
  ],
  hi: [
    {
      q: 'भरोसा फ्रीलांसर और क्लाइंट दोनों की सुरक्षा कैसे करता है?',
      a: 'काम शुरू होने से पहले क्लाइंट PayPal पर भुगतान सुरक्षित रखता है, और पैसा रिलीज़ होने से पहले AI तय चेकलिस्ट के अनुसार काम की जांच करता है।',
    },
    {
      q: 'PayPal पर "रोका गया, कटा नहीं" का क्या मतलब है?',
      a: 'क्लाइंट का पैसा PayPal पर रिज़र्व (लॉक) हो जाता है ताकि भुगतान पक्का रहे, लेकिन काम पूरा होने और रिलीज़ होने तक पैसा कटता नहीं है।',
    },
    {
      q: 'क्या AI अपने आप पैसा रिलीज़ या रद्द कर सकता है?',
      a: 'कभी नहीं। AI केवल चेकलिस्ट के अनुसार काम की जांच करके सुझाव देता है। पैसा रिलीज़ करने का अंतिम बटन हमेशा क्लाइंट ही दबाता है।',
    },
    {
      q: 'डॉलर ($) से रुपये (₹) का हिसाब कैसे दिखता है?',
      a: 'विदेशी क्लाइंट PayPal पर USD में भुगतान करते हैं और हम साथ में तुरंत उसका रुपये (₹) में मूल्य दिखाते हैं।',
    },
    {
      q: 'अगर काम में सुधार चाहिए या कोई असहमति हो तो क्या होगा?',
      a: 'क्लाइंट 2 बार "सुधार मांगें" दबा सकता है, या "कुछ गड़बड़ है?" पर टैप करके 5-लाइन का निष्पक्ष AI समाधान ले सकता है।',
    },
  ],
  hinglish: [
    {
      q: 'Bharosa freelancer aur client dono ko safe kaise rakhta hai?',
      a: 'Kaam shuru hone se pehle client PayPal par payment lock karta hai, aur paisa release hone se pehle AI checklist ke hisaab se kaam check karta hai.',
    },
    {
      q: 'PayPal par "Roka hai, kata nahi" ka kya matlab hota hai?',
      a: 'Client ka paisa PayPal par safe lock ho jata hai taaki payment pakki rahe, par jab tak kaam pura nahi hota tab tak paisa kat-ta nahi hai.',
    },
    {
      q: 'Kya AI apne aap paisa release ya cancel kar sakta hai?',
      a: 'Kabhi nahi. AI sirf files check karke batata hai ki checklist puri hui ya nahi. Paisa release karne ka button hamesha client hi dabata hai.',
    },
    {
      q: 'Dollar ($) aur Rupee (₹) ka hisaab kaise dikhta hai?',
      a: 'Bahar ke clients PayPal par USD ($) mein pay karte hain, aur hum aapko saath mein Rupee (₹) ka hisaab dikhate hain.',
    },
    {
      q: 'Agar client ko fixes chahiye ya koi dikkat ho toh?',
      a: 'Client 2 baar "Fix karwao" daba kar revision maang sakta hai, ya "Koi dikkat hai?" daba kar 5-line ka neutral faisla le sakta hai.',
    },
  ],
};

export function getFaqsForLanguage(lang: LanguageCode): FaqItem[] {
  return FAQS_BY_LANG[lang] || FAQS_BY_LANG.en;
}
