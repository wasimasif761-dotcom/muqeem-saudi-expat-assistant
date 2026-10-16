import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, AlertCircle, RefreshCw } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

export const AIAdvisor: React.FC = () => {
  const { lang, t, isRtl } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: lang === 'ur'
        ? 'السلام علیکم! میں مقیم کا AI مشیر ہوں۔ آپ مجھ سے سعودی اقامہ تجدید، قویٰ پر کفالت کی منتقلی، ایجار کرایہ نامہ یا لیبر قوانین سے متعلق کچھ بھی پوچھ سکتے ہیں۔'
        : lang === 'ar'
          ? 'أهلاً بك! أنا مستشار مقيم الذكي. يسعدني الإجابة على كافة استفساراتك حول تجديد الإقامة، منصة قوى، نقل الكفالة، عقد إيجار ونظام العمل السعودي.'
          : 'Welcome! I am your Muqeem Expat AI Advisor. Ask me anything about Saudi Iqama renewal, Qiwa sponsorship transfers, Ejar rental agreements, or labor rights.',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-configured expert knowledge responses for common queries (instant offline support)
  const getOfflineKnowledge = (query: string): string | null => {
    const q = query.toLowerCase();

    // 1. Iqama late renewal fine
    if (q.includes('fine') || q.includes('جرمانہ') || q.includes('غرامة') || q.includes('penalty')) {
      if (lang === 'ur') {
        return 'سعودی قوانین کے مطابق اقامہ کی میعاد ختم ہونے پر 3 دن کی رعایت دی جاتی ہے۔ اس کے بعد پہلی بار تاخیر پر 500 ریال، دوسری بار 1,000 ریال جرمانہ ہے۔ اگر تیسری بار بھی بروقت تجدید نہ ہو تو حتمی خروج (ڈیپورٹیشن) کی کارروائی ہو سکتی ہے۔ تجدید سے پہلے سداد کے ذریعے فیس ادا کرنا اور میڈیکل انشورنس کا فعال ہونا لازمی ہے۔';
      }
      if (lang === 'ar') {
        return 'تمنح المديرية العامة للجوازات مهلة سماح مدتها 3 أيام بعد انتهاء الإقامة. بعد ذلك، تفرض غرامة 500 ريال للمرة الأولى، و1,000 ريال للمرة الثانية، وفي المرة الثالثة يُبعد المقيم. يشترط لتجديد الإقامة سريان التأمين الطبي وسداد الرسوم والمخالفات المرورية عبر سداد.';
      }
      return 'Saudi Passports Directorate (Jawazat) grants a 3-day grace period following Iqama expiry. Afterward, late renewal carries a 500 SAR fine for the 1st violation and 1,000 SAR for the 2nd violation. Before renewal, ensure health insurance is active on CCHI and all traffic violations are settled via SADAD.';
    }

    // 2. Transfer sponsorship via Qiwa
    if (q.includes('qiwa') || q.includes('transfer') || q.includes('کفالت') || q.includes('نقل') || q.includes('kafeel')) {
      if (lang === 'ur') {
        return 'قویٰ (Qiwa) پلیٹ فارم پر پردیسی ملازم درج ذیل صورتوں میں موجودہ کفیل کی اجازت کے بغیر نئی کمپنی میں ٹرانسفر ہو سکتا ہے:\n1. اگر آپ کا اقامہ یا ورک پرمٹ ختم ہو چکا ہو اور کمپنی نے تجدید نہ کی ہو۔\n2. اگر کمپنی نے مسلسل 3 ماہ تنخواہ نہ دی ہو۔\n3. اگر لیبر کنٹریکٹ کی مدت ختم ہو چکی ہو اور نوٹس پیریڈ کا وقت پورا ہو۔\nنئی کمپنی قویٰ پر ٹرانسفر ریکویسٹ بھیجے گی، جسے آپ کو اپنے قویٰ اکاؤنٹ سے 10 دن کے اندر منظور کرنا ہوگا۔';
      }
      if (lang === 'ar') {
        return 'وفق مبادرة تحسين العلاقة التعاقدية عبر منصة قوى، يحق للعامل الانتقال لصاحب عمل جديد دون موافقة صاحب العمل الحالي في الحالات التالية:\n1. انتهاء الإقامة أو رخصة العمل دون تجديد.\n2. عدم استلام الأجور لمدة 3 أشهر متتالية.\n3. انتهاء مدة عقد العمل الموثق مع تقديم الإشعار النظامي.\nيتم قبول العرض الوظيفي إلكترونياً عبر حساب العامل في قوى خلال 10 أيام.';
      }
      return 'Under Saudi Labor Contractual Reforms on the Qiwa platform, you may transfer to a new employer without your current sponsor approval if:\n1. Your Iqama or work permit is expired.\n2. Employer delayed wages for 3 consecutive months.\n3. Your certified contract term ended and proper notice was provided.\nThe new company initiates the request on Qiwa; you must accept it via your Qiwa employee portal within 10 days.';
    }

    // 3. Ejar contract
    if (q.includes('ejar') || q.includes('ایجار') || q.includes('إيجار') || q.includes('rent')) {
      if (lang === 'ur') {
        return 'سعودی عرب میں تمام رہائشی کرایہ نامے ایجار (Ejar) پورٹل پر رجسٹر ہونا لازمی ہیں۔ بینک اکاؤنٹ، فیملی وزٹ ویزہ یا ایڈریس پروف کے لیے ایجار کا معاہدہ پیش کرنا ضروری ہے۔ تمام کرائے کی اقساط اب سداد (SADAD) یا مدی کارڈ کے ذریعے براہ راست ایجار والٹ میں ادا کی جاتی ہیں۔';
      }
      if (lang === 'ar') {
        return 'توثيق عقود الإيجار السكني في منصة إيجار إلزامي لكافة المقيمين في المملكة لإثبات العنوان الوطني ولإنجاز المعاملات البنكية واستقدام العائلة. يتم سداد الإيجار حصرياً عبر نظام سداد المربوط بالمنصة لضمان إيداع المبالغ فورياً وتوثيق الإيصالات رسمياً.';
      }
      return 'All residential leases in Saudi Arabia must be officially certified on the Ejar network. It serves as your official proof of address for banks, Absher, and family visas. All rental payments must now be processed electronically through SADAD on the Ejar platform.';
    }

    // 4. Emergency Helplines in Jeddah
    if (q.includes('emergency') || q.includes('نمبر') || q.includes('طوارئ') || q.includes('حادث') || q.includes('911') || q.includes('ambulance') || q.includes('police')) {
      if (lang === 'ur') {
        return 'جدہ اور مکہ مکرمہ ریجن کے اہم ایمرجنسی نمبرز:\n• 911 - تمام ہنگامی حالات کا قومی ہیلپ لائن (پولیس، ایمبولینس، ٹریفک، سول ڈیفنس)\n• 997 - ہلال احمر (ایمبولینس)\n• 199033 - نجم (گاڑیوں کے حادثات کی انشورنس رپورٹ)\n• 19911 - وزارت افرادی قوت (لیبر شکایات و قویٰ سپورٹ)\n• 993 - ٹریفک پولیس (مرور)';
      }
      if (lang === 'ar') {
        return 'أرقام الطوارئ المعتمدة في جدة ومنطقة مكة المكرمة:\n• 911 - المركز الوطني للعمليات الأمنية الموحدة (الشرطة، المرور، الإسعاف، الدفاع المدني)\n• 997 - الهلال الأحمر السعودي (الإسعاف الطبي)\n• 199033 - شركة نجم لمباشرة الحوادث المرورية المؤمنة\n• 19911 - وزارة الموارد البشرية (الشكاوى العمالية وقوى)';
      }
      return 'Key Emergency Helplines in Jeddah & Makkah Region:\n• 911 - Unified National Emergency Operations Center (Police, Ambulance, Traffic, Civil Defense)\n• 997 - Saudi Red Crescent (Medical Ambulance)\n• 199033 - Najm (Mandatory for motor vehicle accident reports)\n• 19911 - Ministry of Human Resources (Labor disputes & Qiwa support)\n• 993 - Traffic Police (Muroor)';
    }

    // 5. Driving License & Dallah
    if (q.includes('license') || q.includes('driving') || q.includes('لائسنس') || q.includes('رخصة') || q.includes('dallah') || q.includes('دلہ')) {
      if (lang === 'ur') {
        return 'سعودی ڈرائیونگ لائسنس حاصل کرنے کا طریقہ:\n1. کسی بھی منظور شدہ ہسپتال یا کلینک سے افادہ (Efada) میڈیکل ٹیسٹ کروائیں۔\n2. ابشر (Absher) پورٹل کے ذریعے دلہ ڈرائیونگ سکول (الرحاب جدہ) کی اپوائنٹمنٹ بک کریں۔\n3. ڈرائیونگ ٹیسٹ اور کلاسز پاس کرنے کے بعد اسی دن لائسنس جاری ہو جاتا ہے۔';
      }
      if (lang === 'ar') {
        return 'خطوات استخراج رخصة القيادة في جدة:\n1. إجراء الفحص الطبي (نظام إفادة) في مستوصف معتمد.\n2. حجز موعد تقييم قيادة عبر منصة أبشر (قطاع المرور) في مدرسة دلة بالرحاب.\n3. اجتياز التدريب والاختبارين النظري والميداني واستلام الرخصة مباشرة.';
      }
      return 'Steps to obtain a Saudi Driving License in Jeddah:\n1. Complete an approved medical exam (Efada system).\n2. Book an assessment appointment on Absher (Muroor section) for Dallah Driving School (Al-Rehab, Jeddah).\n3. Complete the required training hours, pass theoretical computer test and practical road test to receive your license.';
    }

    return null;
  };

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 1. Try server Gemini API first
      let replyText: string | null = null;
      try {
        const res = await fetch('/api/gemini/advisor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: textToSend, lang }),
        });
        if (res.ok) {
          const json = await res.json();
          replyText = json.answer;
        }
      } catch {
        // Fallback to offline knowledge base
      }

      if (!replyText) {
        replyText = getOfflineKnowledge(textToSend);
      }

      if (!replyText) {
        replyText = lang === 'ur'
          ? 'آپ کے سوال کا شکریہ۔ سعودی قوانین کے مطابق اقامہ، پاسپورٹ یا کفالت کی تفصیلات چیک کرنے کے لیے آپ ابشر (Absher) یا قویٰ (Qiwa) پورٹل میں لاگ ان کریں۔ مزید تفصیلی سوال کے لیے الفاظ واضح درج کریں۔'
          : lang === 'ar'
            ? 'شكراً لاستفسارك. للإجراءات التفصيلية الخاصة بسجلّك النظامي، يُرجى مراجعة منصة أبشر للأفراد أو منصة قوى المعتمدة من وزارة الموارد البشرية.'
            : 'For detailed verification of your personal status, check your Absher Individuals or Qiwa portal. Both portals reflect live updates directly from Saudi Ministry databases.';
      }

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="rounded-3xl bg-slate-900 border border-emerald-700/40 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{t.advisor.title}</h2>
            <p className="text-xs text-slate-300">{t.advisor.subtitle}</p>
          </div>
        </div>

        {/* Sample Prompt Chips */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2 text-xs">
          {[t.advisor.sampleQ1, t.advisor.sampleQ2, t.advisor.sampleQ3, t.advisor.sampleQ4].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] transition text-start"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="rounded-3xl bg-slate-950 border border-slate-800/80 p-4 sm:p-5 shadow-2xl min-h-[360px] max-h-[500px] overflow-y-auto space-y-3.5">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${isUser ? (isRtl ? 'flex-row' : 'flex-row-reverse') : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-slate-700 text-slate-200'
                    : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 p-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Consulting Saudi Labor & Passports Regulations...</span>
          </div>
        )}
      </div>

      {/* Input box */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={input}
          placeholder={t.advisor.placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition active:scale-95 flex items-center gap-1.5"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">{t.advisor.send}</span>
        </button>
      </div>

      <p className="text-[10px] text-slate-500 text-center px-4">
        {t.advisor.disclaimer}
      </p>
    </div>
  );
};
