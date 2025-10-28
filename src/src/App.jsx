import React, { useState } from 'react'
import html2pdf from 'html2pdf.js'
import { AcademicCapIcon, BriefcaseIcon, SparklesIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

export default function App() {
  const [form, setForm] = useState({ name: '', job: '', skills: '', education: '', template: 'طالب حديث التخرج' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const toggleDarkMode = () => setDarkMode(!darkMode)

  const generateCV = async () => {
    if (!form.name || !form.job) {
      alert('الرجاء إدخال الاسم والمهنة على الأقل.')
      return
    }

    setLoading(true)
    setResult('')

    try {
      const prompt = `
اكتب سيرة ذاتية احترافية باللغة العربية تناسب القالب: ${form.template}.
الاسم: ${form.name}
المهنة: ${form.job}
المؤهلات: ${form.education || 'غير محددة'}
المهارات: ${form.skills || 'غير محددة'}
اجعل السيرة موجزة، منظمة، وجذابة للباحث عن وظيفة.
      `

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'أنت خبير في كتابة السير الذاتية باللغة العربية بشكل احترافي.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 500
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // 👇👇 ضع المفتاح في ملف .env كما في الشرح بالأسفل
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
          }
        }
      )

      const aiText = response.data.choices[0].message.content
      setResult(aiText)
    } catch (error) {
      console.error(error)
      alert('حدث خطأ أثناء إنشاء السيرة الذاتية. تأكد من مفتاح OpenAI API.')
    }

    setLoading(false)
  }

  const downloadPDF = () => {
    const element = document.getElementById('cv-preview')
    html2pdf().from(element).set({ filename: `${form.name || 'CV'}.pdf` }).save()
  }

  return (
    <div className={`${darkMode ? 'bg-gradient-to-br from-blue-900 via-slate-800 to-gray-900 text-white' : 'bg-white text-gray-900'} min-h-screen flex flex-col items-center justify-start px-4 py-6 transition-colors duration-500`}>
      
      <div className="flex w-full justify-end max-w-4xl mb-4">
        <button onClick={toggleDarkMode} className="px-4 py-2 rounded bg-blue-600 hover:opacity-90">
          {darkMode ? '☀️ وضع فاتح' : '🌙 وضع داكن'}
        </button>
      </div>

      <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center">
        🧠 مولد السيرة الذاتية الذكي
      </h1>

      <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-10 w-full max-w-2xl shadow-2xl mb-8">
        <div className="grid gap-4">
          <input name="name" onChange={handleChange} placeholder="الاسم الكامل" className="p-3 rounded bg-white/20 text-white placeholder:text-white" />
          <input name="job" onChange={handleChange} placeholder="المهنة" className="p-3 rounded bg-white/20 text-white placeholder:text-white" />
          <input name="education" onChange={handleChange} placeholder="المؤهلات الدراسية" className="p-3 rounded bg-white/20 text-white placeholder:text-white" />
          <input name="skills" onChange={handleChange} placeholder="المهارات" className="p-3 rounded bg-white/20 text-white placeholder:text-white" />

          <select name="template" onChange={handleChange} className="p-3 rounded bg-white/20 text-white placeholder:text-white">
            <option>طالب حديث التخرج</option>
            <option>خريج جامعي</option>
            <option>إدارة/موظف</option>
            <option>باحث عن عمل عام</option>
            <option>مصمم/إبداعي</option>
          </select>

          <button onClick={generateCV} className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 rounded-xl py-3 font-semibold text-lg">
            {loading ? '⏳ جاري الإنشاء...' : '✨ إنشاء السيرة الذاتية'}
          </button>
        </div>
      </div>

      {result && (
        <div className="flex flex-col items-center gap-4 w-full max-w-5xl">
          <div id="cv-preview" className="flex justify-center gap-6 flex-wrap">
            {[0.9, 1.1, 0.9].map((scale, i) => (
              <div
                key={i}
                style={{ transform: `scale(${scale})` }}
                className={`bg-white/10 text-white rounded-2xl p-5 w-[280px] md:w-[320px] text-sm shadow-lg backdrop-blur-lg transition-transform duration-300 hover:scale-105 ${
                  i === 1 ? 'border-2 border-blue-400' : 'opacity-70'
                }`}
              >
                <h2 className="text-xl font-bold mb-2 text-center">{form.name || 'الاسم'}</h2>
                <p className="text-center text-blue-300 flex items-center justify-center gap-2">
                  <BriefcaseIcon className="w-5 h-5"/> {form.job || 'المهنة'}
                </p>
                <hr className="my-2 border-white/20" />
                <div className="flex items-center gap-2 mb-1">
                  <AcademicCapIcon className="w-5 h-5 text-yellow-300"/> <span>المؤهلات: {form.education || 'غير محددة'}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <SparklesIcon className="w-5 h-5 text-green-300"/> <span>المهارات: {form.skills || 'غير محددة'}</span>
                </div>
                <pre className="whitespace-pre-wrap text-[13px] leading-relaxed mt-2">{result}</pre>
              </div>
            ))}
          </div>
          <button onClick={downloadPDF} className="mt-4 bg-green-600 hover:opacity-90 rounded-xl py-3 px-6 font-semibold">
            💾 تحميل PDF
          </button>
        </div>
      )}
    </div>
  )
}
