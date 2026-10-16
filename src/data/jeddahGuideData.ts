import { JeddahGuideItem } from '../types';

export const jeddahGuideList: JeddahGuideItem[] = [
  // 1. Emergency Helplines
  {
    id: 'em-911',
    category: 'emergency',
    titleEn: '911 Unified National Emergency Center (Makkah & Jeddah)',
    titleUr: '911 قومی ایمرجنسی سنٹر (مکہ و جدہ)',
    titleAr: 'المركز الوطني الموحد للعمليات الأمنية (911)',
    descriptionEn: 'Unified emergency number for Police, Traffic, Ambulance, Civil Defense, and Highway Patrol in Jeddah and the Western Region. Responders speak Arabic, English, and Urdu.',
    descriptionUr: 'جدہ اور مغربی ریجن میں پولیس، ایمبولینس، فائر بریگیڈ اور ٹریفک کے لیے واحد مشترکہ ایمرجنسی نمبر۔ آپ اردو، انگریزی یا عربی میں بات کر سکتے ہیں۔',
    descriptionAr: 'الرقم الموحد للطوارئ الأمنية (الشرطة، المرور، الدفاع المدني، أمن الطرق) في منطقة مكة المكرمة وجدة على مدار الساعة.',
    phone: '911',
    badge: '24/7 Unified Helpline',
  },
  {
    id: 'em-997',
    category: 'emergency',
    titleEn: '997 Red Crescent (Ambulance Service)',
    titleUr: '997 ہلال احمر (ایمبولینس سروس)',
    titleAr: 'الهلال الأحمر السعودي - الإسعاف (997)',
    descriptionEn: 'Immediate medical ambulance dispatch for critical health emergencies, home crises, and cardiac incidents across all Jeddah districts.',
    descriptionUr: 'طبی ہنگامی حالات اور گھر پر ایمبولینس بلانے کے لیے ہلال احمر کا نمبر۔ تمام علاقوں میں فوری سروس۔',
    descriptionAr: 'طلب الإسعاف الفوري للحالات الطبية الطارئة والحوادث في كافة أحياء جدة.',
    phone: '997',
    badge: 'Medical Emergency',
  },
  {
    id: 'em-najm',
    category: 'emergency',
    titleEn: 'Najm for Insurance Traffic Accidents (199033)',
    titleUr: 'نجم - ٹریفک حادثات کی انشورنس رپورٹ (199033)',
    titleAr: 'شركة نجم لخدمات التأمين والحوادث (199033)',
    descriptionEn: 'Mandatory service to call in case of any motor accident in Jeddah when at least one party has valid insurance. Do not move vehicles before Najm surveyor arrives or instructs via app.',
    descriptionUr: 'جدہ میں گاڑی کے حادثے کی صورت میں نجم کو کال کرنا ضروری ہے اگر کسی ایک کے پاس انشورنس ہو۔ گاڑی کو مت ہٹائیں جب تک سرویئر اجازت نہ دے۔',
    descriptionAr: 'الجهة المخولة بمباشرة الحوادث المرورية المؤمنة في جدة وتقدير الأضرار ورفع تقرير الحادث إلكترونياً.',
    phone: '199033',
    website: 'https://www.najm.sa',
    badge: 'Car Accident Service',
  },

  // 2. Government & Jawazat Offices
  {
    id: 'gov-jawazat-rehab',
    category: 'government',
    titleEn: 'General Directorate of Passports (Jawazat) - Al Rehab, Jeddah',
    titleUr: 'ڈائریکٹوریٹ آف پاسپورٹس (جوازات) - الرحاب، جدہ',
    titleAr: 'المديرية العامة للجوازات - فرع الرحاب بجدة',
    descriptionEn: 'Main passports & expat affairs center in Jeddah for Iqama biometric fingerprinting, lost Iqama replacement, dependent passport linking, and transfer exceptions.',
    descriptionUr: 'جدہ میں فنگر پرنٹ (بصمات)، گمشدہ اقامہ کا متبادل، فیملی پاسپورٹ اپڈیٹ اور اقامہ کے مسائل حل کرنے کا مرکزی دفتر۔',
    descriptionAr: 'المقر الرئيسي للجوازات بجدة لخدمات البصمة، تمديد وتعديل معلومات الجوازات للمقيمين وتجديد الإقامات.',
    location: 'Umm Al Qura Street, Al Rehab District, Jeddah',
    phone: '0126700000',
    website: 'https://www.absher.sa',
    mapQuery: 'Jawazat Al Rehab Jeddah',
    stepsEn: [
      'Book an Absher appointment under Jawazat service before visiting.',
      'Bring original Passport, existing Iqama (if available), and Appointment Slip.',
      'Men and Women have designated counters with separate queues.'
    ],
    stepsUr: [
      'جانے سے پہلے ابشر اکاؤنٹ پر جا کر جوازات کی اپوائنٹمنٹ بک کریں۔',
      'اصل پاسپورٹ، موجودہ اقامہ (اگر ہو) اور بکنگ سلپ ساتھ لے کر جائیں۔',
      'خواتین اور حضرات کے الگ الگ کاؤنٹرز ہیں۔'
    ],
    stepsAr: [
      'حجز موعد مسبق عبر منصة أبشر قبل زيارة الفرع.',
      'إحضار أصل جواز السفر والإقامة الحالية وتذكرة الموعد.',
      'تتوفر صالات مخصصة للرجال وأخرى للسيدات.'
    ]
  },
  {
    id: 'gov-qiwa-labor',
    category: 'government',
    titleEn: 'Ministry of Human Resources & Labor Office (Qiwa Support)',
    titleUr: 'وزارت افرادی قوت و لیبر آفس (قویٰ پلیٹ فارم سپورٹ)',
    titleAr: 'مكتب العمل - فرع الأندلس بجدة (وزارة الموارد البشرية)',
    descriptionEn: 'Assists expatriate workers with contractual disputes, wage protection (WPS), labor law enforcement, and Qiwa electronic service validation.',
    descriptionUr: 'ملازمین کے حقوق، تنخواہوں کی تاخیر، کفالت کی منتقلی اور قویٰ کے مسائل میں قانونی مدد فراہم کرتا ہے۔',
    descriptionAr: 'الفرع المختص بحل النزاعات العمالية، حماية الأجور، وتوثيق عقود العمل عبر منصة قوى.',
    location: 'Al Andalus District, Near Tahlia Street, Jeddah',
    phone: '19911',
    website: 'https://qiwa.sa',
    mapQuery: 'Labor Office Al Andalus Jeddah',
  },
  {
    id: 'gov-ejar',
    category: 'government',
    titleEn: 'Ejar Electronic Tenancy Platform (Balady & Housing)',
    titleUr: 'ایجار پلیٹ فارم - تصدیق شدہ رہائشی کرایہ نامہ',
    titleAr: 'شبكة إيجار المطورة - توثيق عقود الإيجار السكنية',
    descriptionEn: 'Official government network where all rental leases in Jeddah must be registered. Required to prove residential address for Absher, bank accounts, and family visa.',
    descriptionUr: 'جدہ میں گھر کرائے پر لینے کے بعد تمام معاہدوں کا ایجار پر درج ہونا لازمی ہے۔ بینک اکاؤنٹ اور فیملی ویزہ کے لیے ضروری دستاویز ہے۔',
    descriptionAr: 'المنصة الوطنية المعتمدة لتوثيق عقود الإيجار السكني والتجاري وسداد الإيجار عبر سداد لضمان حقوق المؤجر والمستأجر.',
    website: 'https://www.ejar.sa',
    phone: '199011',
    badge: 'Mandatory Rental Portal',
  },

  // 3. Healthcare & Major Hospitals in Jeddah
  {
    id: 'hosp-king-fahd',
    category: 'healthcare',
    titleEn: 'King Fahd General Hospital (Government Tertiary Care)',
    titleUr: 'کنگ فہد جنرل ہسپتال - جدہ (سرکاری ہسپتال)',
    titleAr: 'مستشفى الملك فهد العام بجدة',
    descriptionEn: 'The largest public hospital in Jeddah with comprehensive 24/7 trauma and emergency department, intensive care, and specialized surgery.',
    descriptionUr: 'جدہ کا سب سے بڑا سرکاری ہسپتال جہاں 24 گھنٹے ایمرجنسی، آئی سی یو اور سرجری کی بہترین سہولیات دستیاب ہیں۔',
    descriptionAr: 'أكبر مجمع طبي حكومي في جدة يقدم خدمات الطوارئ والعناية المركزة والجراحة على مدار الساعة.',
    location: 'Al Andalus, Jeddah 23325',
    phone: '0126606111',
    mapQuery: 'King Fahd Hospital Jeddah',
  },
  {
    id: 'hosp-fakeeh',
    category: 'healthcare',
    titleEn: 'Dr. Soliman Fakeeh Hospital (DSFH)',
    titleUr: 'ڈاکٹر سلیمان فقیہ ہسپتال - فلسطین روڈ',
    titleAr: 'مستشفى الدكتور سليمان فقيه - شارع فلسطين',
    descriptionEn: 'Leading private multi-specialty hospital accepted by almost all expatriate health insurance providers (Bupa, Tawuniya, Medgulf, Malath). Excellent emergency center.',
    descriptionUr: 'جدہ کا مشہور پرائیویٹ ہسپتال جہاں بوپا، تعاون یہ اور تمام بڑی انشورنس کمپنیاں قبول کی جاتی ہیں۔ بہترین ڈاکٹرز۔',
    descriptionAr: 'من أعرق وأكبر المستشفيات الخاصة بجدة، معتمد لدى كافة شركات التأمين الصحي ويضم أقسام طوارئ متطورة.',
    location: 'Palestine Street, Al Hamra District, Jeddah',
    phone: '0126655000',
    website: 'https://www.fakeeh.care',
    mapQuery: 'Dr Soliman Fakeeh Hospital Jeddah',
  },
  {
    id: 'hosp-imc',
    category: 'healthcare',
    titleEn: 'International Medical Center (IMC) Jeddah',
    titleUr: 'انٹرنیشنل میڈیکل سنٹر (آئی ایم سی) - حائل سٹریٹ',
    titleAr: 'المركز الطبي الدولي (IMC) بجدة',
    descriptionEn: 'State-of-the-art tertiary hospital associated with Cleveland Clinic. High-end inpatient, pediatric, and cardiology facilities.',
    descriptionUr: 'جدہ کا جدید ترین ہسپتال جو کلیولینڈ کلینک کے معیار پر قائم ہے۔ صفائی اور دیکھ بھال کا اعلیٰ معیار۔',
    descriptionAr: 'صرح طبي متطور مرتبط بمستشفى كليفلاند كلينك، يقدم رعاية صحية تخصصية شاملة.',
    location: 'Ha’il Street, Al Ruwais District, Jeddah',
    phone: '0126509000',
    website: 'https://www.imc.med.sa',
    mapQuery: 'International Medical Center Jeddah',
  },

  // 4. Expatriate Procedures
  {
    id: 'proc-iqama-renew',
    category: 'procedures',
    titleEn: 'How to Renew Iqama & Avoid 500 SAR Late Fine',
    titleUr: 'اقامہ تجدید کا طریقہ اور 500 ریال جرمانے سے بچاؤ',
    titleAr: 'خطوات تجديد هوية مقيم وتفادي غرامة التأخير',
    descriptionEn: 'Saudi regulations grant a 3-day grace period after Iqama expiry. Late renewal results in a 500 SAR fine for the first time and 1,000 SAR on second recurrence.',
    descriptionUr: 'اقامہ ختم ہونے کے بعد 3 دن کی رعایت ہوتی ہے۔ تاخیر پر پہلی دفعہ 500 ریال اور دوسری دفعہ 1000 ریال جرمانہ عائد ہوتا ہے۔',
    descriptionAr: 'تمنح الجوازات مهلة 3 أيام بعد انتهاء الإقامة، ويفرض بعدها غرامة 500 ريال للمرة الأولى و1000 ريال عند التكرار.',
    stepsEn: [
      'Ensure valid Medical Insurance is active on the CCHI portal.',
      'Sponsor pays the Government Iqama Fee (650 SAR/year) and Expat Dependent Levy via SADAD banking.',
      'Ensure there are no unpaid Traffic Violations on your Iqama.',
      'Sponsor submits renewal via Absher Business or Muqeem electronic portal.'
    ],
    stepsUr: [
      'طبی انشورنس کا پورٹل پر فعال ہونا لازمی ہے۔',
      'کفیل یا کمپنی سداد کے ذریعے سالانہ فیس (650 ریال) اور فیملی لیوی ادا کرے۔',
      'اقامے پر کوئی ٹریفک چالان باقی نہ ہو۔',
      'کفیل ابشر بزنس یا مقیم پورٹل کے ذریعے تجدید مکمل کرے۔'
    ],
    stepsAr: [
      'التأكد من سريان التأمين الطبي المربوط بمجلس الضمان الصحي.',
      'سداد الرسوم الحكومية للإقامة والمقابل المالي عبر نظام سداد.',
      'سداد كافة المخالفات المرورية المسجلة على المقيم.',
      'يقوم صاحب العمل بإتمام التجديد عبر منصة أبشر أعمال أو منصة مقيم.'
    ]
  },
  {
    id: 'proc-qiwa-transfer',
    category: 'procedures',
    titleEn: 'Transfer Sponsorship via Qiwa (No-Objection Guidelines)',
    titleUr: 'قویٰ پلیٹ فارم کے ذریعے کفالت کی منتقلی کا طریقہ',
    titleAr: 'نقل الخدمات عبر منصة قوى (حالات النقل بدون موافقة صاحب العمل)',
    descriptionEn: 'Under modern Saudi Labor Reforms, expatriate employees can transfer to a new employer without current sponsor approval in specific legal situations.',
    descriptionUr: 'سعودی لیبر اصلاحات کے تحت اگر اقامہ ختم ہو چکا ہو یا 3 ماہ تنخواہ نہ ملی ہو تو بغیر کفیل کی اجازت نقل کفالت ہو سکتی ہے۔',
    descriptionAr: 'تتيح منصة قوى للعامل الوافد الانتقال لصاحب عمل جديد دون اشتراط موافقة صاحب العمل الحالي في حالات قانونية محددة.',
    stepsEn: [
      'Eligible if your Iqama is expired and not renewed by employer.',
      'Eligible if employer failed to pay salary for 3 consecutive months.',
      'Eligible when current work contract period has naturally concluded with proper notice.',
      'New employer issues offer on Qiwa -> Employee accepts in Qiwa account within 10 days.'
    ],
    stepsUr: [
      'اگر اقامہ ختم ہو چکا ہو اور کمپنی نے تجدید نہ کی ہو۔',
      'اگر مسلسل 3 ماہ تنخواہ کی ادائیگی نہ ہوئی ہو۔',
      'اگر موجودہ معاہدہ ختم ہو گیا ہو اور نوٹس پیریڈ پورا کیا گیا ہو۔',
      'نئی کمپنی قویٰ پر آفر بھیجے گی، آپ اپنے قویٰ اکاؤنٹ سے 10 دن کے اندر قبول کریں۔'
    ],
    stepsAr: [
      'في حال انتهاء رخصة العمل أو الإقامة وعدم تجديدها.',
      'في حال تأخر صرف الأجور لمدة 3 أشهر متتالية.',
      'عند انتهاء مدة عقد العمل الموثق مع إشعار صاحب العمل بالإشعار النظامي.',
      'يقدم صاحب العمل الجديد طلباً عبر قوى، ويوافق العامل عليه خلال 10 أيام.'
    ]
  },
  {
    id: 'proc-license-dallah',
    category: 'procedures',
    titleEn: 'Getting Saudi Driving License at Dallah Al Rehab',
    titleUr: 'دلہ سکول الرحاب جدہ سے سعودی ڈرائیونگ لائسنس کا حصول',
    titleAr: 'استخراج رخصة القيادة من دلة لتعليم القيادة بجدة',
    descriptionEn: 'Guide to practical driving assessment, mandatory theoretical hours, medical checkup (Efada), and test at Dallah Driving School Al Rehab.',
    descriptionUr: 'دلہ ڈرائیونگ سکول جدہ سے لائسنس حاصل کرنے، میڈیکل ٹیسٹ اور ڈرائیونگ ٹیسٹ کا مرحلہ وار طریقہ۔',
    descriptionAr: 'إجراءات تقييم القيادة، حجز الساعات التدريبية، الفحص الطبي (إفادة) والاختبار النظري والعملي في دلة جدة.',
    location: 'Palestine St / Al Rehab District, Jeddah',
    stepsEn: [
      'Complete Medical Test for Driving License (Efada) at an approved clinic.',
      'Book a Driving Assessment Appointment on Absher (Muroor section).',
      'Attend driving evaluation at Dallah to determine required training hours.',
      'Pass computer road sign test and parking/road driving exam, then receive instant license.'
    ],
    stepsUr: [
      'کسی بھی منظور شدہ کلینک سے افادہ کا میڈیکل ٹیسٹ کروائیں۔',
      'ابشر پر جا کر دلہ سکول کی اپوائنٹمنٹ بک کریں۔',
      'دلہ پہنچ کر ڈرائیونگ ٹرائل دیں تاکہ کورس کے دن مقرر ہوں۔',
      'کمپیوٹر ٹیسٹ اور پریکٹیکل ٹیسٹ پاس کریں، لائسنس اسی وقت جاری کر دیا جائے گا۔'
    ],
    stepsAr: [
      'إجراء الفحص الطبي لرخصة القيادة (نظام إفادة) في مستوصف معتمد.',
      'حجز موعد تقييم قيادة عبر منصة أبشر (قطاع المرور).',
      'حضور التقييم لتحديد المستوى (مبتدئ / متوسط / متقدم).',
      'اجتياز الاختبار النظري والميداني واستلام الرخصة فوراً.'
    ]
  }
];
