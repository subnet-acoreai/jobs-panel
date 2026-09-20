import { useEffect, useRef, useState } from 'react'

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-[12px] text-gray-500">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  )
}

const underline =
  'w-full border-0 border-b border-gray-200 bg-transparent px-0 py-1.5 text-sm outline-none placeholder:text-gray-300 focus:border-brand dark:border-night-line'

export default function ApplyForm({ job }) {
  const company = job?.company || 'this company'
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [videoBlob, setVideoBlob] = useState(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [videoError, setVideoError] = useState('')
  const mediaRef = useRef(null)
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const videoEl = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => stopStream()
  }, [])

  function stopStream() {
    clearInterval(timerRef.current)
    mediaRef.current?.getTracks().forEach((t) => t.stop())
    mediaRef.current = null
  }

  async function startRecording() {
    setVideoError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      mediaRef.current = stream
      if (videoEl.current) videoEl.current.srcObject = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        setVideoBlob(blob)
        setVideoUrl(URL.createObjectURL(blob))
        stopStream()
        if (videoEl.current) videoEl.current.srcObject = null
      }
      recorder.start()
      setRecording(true)
      setSeconds(0)
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setVideoError('Camera access was blocked. You can still submit the rest of the form.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    setRecording(false)
    clearInterval(timerRef.current)
  }

  function cancelRecording() {
    recorderRef.current?.stop()
    setRecording(false)
    setVideoUrl('')
    setVideoBlob(null)
    stopStream()
    if (videoEl.current) videoEl.current.srcObject = null
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const form = e.currentTarget
    const data = new FormData()
    data.set('jobSlug', job?.slug || '')
    data.set('jobTitle', job?.title || '')
    data.set('company', company)
    data.set('firstName', form.firstName.value.trim())
    data.set('lastName', form.lastName.value.trim())
    data.set('yearsExperience', form.yearsExperience.value)
    data.set('whyCompany', form.whyCompany.value.trim())
    data.set('whyFit', form.whyFit.value.trim())
    data.set('aiTools', form.aiTools.value.trim())
    data.set('coverLetter', form.coverLetter.value.trim())
    data.set('github', form.github.value.trim())
    data.set('linkedin', form.linkedin.value.trim())
    data.set('telegram', form.telegram.value.trim())
    data.set('currentSalary', form.currentSalary.value.trim())
    data.set('phone', form.phone.value.trim())
    data.set('location', form.location.value.trim())
    if (resumeFile) data.set('resume', resumeFile)
    if (photoFile) data.set('photo', photoFile)
    if (videoBlob) data.set('video', new File([videoBlob], 'application.webm', { type: videoBlob.type || 'video/webm' }))

    try {
      const res = await fetch('/api/applications', { method: 'POST', body: data })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(payload.message || 'Could not save application')
      setSent(true)
    } catch (err) {
      setError(err.message || 'Could not save application')
    } finally {
      setSubmitting(false)
    }
  }

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  if (sent) {
    return (
      <div id="apply" className="mt-10 rounded-xl border border-gray-200 px-5 py-8 text-center dark:border-night-line">
        <p className="text-base font-semibold">Application saved</p>
        <p className="mt-2 text-sm text-gray-500">
          Your application for {company} was stored on the local server. Only the hiring admin can review it.
        </p>
      </div>
    )
  }

  return (
    <form id="apply" className="mt-10 border-t border-gray-100 pt-6 dark:border-night-line" onSubmit={onSubmit}>
      <div className="grid items-start gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <Field label="First Name" required>
          <input name="firstName" required placeholder="First Name" className={underline} />
        </Field>
        <Field label="Last Name" required>
          <input name="lastName" required placeholder="Last Name" className={underline} />
        </Field>
        <label className="mx-auto flex cursor-pointer flex-col items-center gap-1 pt-1">
          <span className="text-[12px] text-gray-500">Photo</span>
          <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-gray-400 dark:bg-white/10">
            {photoPreview ? (
              <img src={photoPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z" />
              </svg>
            )}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              setPhotoFile(file || null)
              setPhotoPreview(file ? URL.createObjectURL(file) : '')
            }}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Resume/CV" required>
          <label className={`${underline} flex cursor-pointer items-center gap-2 py-1.5`}>
            <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
              <path d="M14 3v6h6" />
            </svg>
            <span className={resumeFile ? 'text-ink dark:text-white' : 'text-gray-300'}>
              {resumeFile?.name || 'Choose File   No file chosen'}
            </span>
            <input
              required
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
          </label>
        </Field>
        <Field label="Years of Experience" required>
          <input name="yearsExperience" required type="number" min="0" placeholder="Number of years" className={underline} />
        </Field>
      </div>

      <div className="mt-5 space-y-4">
        <Field label={`Why would you like to work on ${company}?`} required>
          <input name="whyCompany" required placeholder="Write your answer here" className={underline} />
        </Field>
        <Field label="Why do you think you're a good fit for this role?" required>
          <input name="whyFit" required placeholder="Write your answer here" className={underline} />
        </Field>
        <Field label="How do you think AI tools are changing the processes of UI/UX design?" required>
          <input name="aiTools" required placeholder="Write your answer here" className={underline} />
        </Field>
        <Field label="Why are you a great fit for this job? (Cover Letter)" required>
          <textarea name="coverLetter" required rows={3} placeholder="Write your answer here" className={`${underline} resize-none`} />
        </Field>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="GitHub">
          <input name="github" placeholder="https://github.com/username" className={underline} />
        </Field>
        <Field label="LinkedIn">
          <input name="linkedin" placeholder="https://www.linkedin.com/in/users/" className={underline} />
        </Field>
        <Field label="Telegram Handle">
          <input name="telegram" placeholder="@satoshi" className={underline} />
        </Field>
        <Field label="Current Salary in USD" required>
          <input name="currentSalary" required placeholder="example: $10000/month" className={underline} />
        </Field>
        <Field label="Phone Number">
          <input name="phone" placeholder="+12 345 678 901" className={underline} />
        </Field>
        <Field label="Current Location">
          <input name="location" placeholder="Current City, Country" className={underline} />
        </Field>
      </div>

      <div className="mt-8">
        <p className="text-sm font-medium">Video Application</p>
        <div className="mt-3 flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-gray-100 px-4 py-8 text-center dark:bg-white/5">
          <video
            ref={videoEl}
            autoPlay
            muted
            playsInline
            src={!recording && videoUrl ? videoUrl : undefined}
            controls={!recording && Boolean(videoUrl)}
            className={`mb-4 max-h-48 w-full max-w-md rounded-lg bg-black/80 ${recording || videoUrl ? 'block' : 'hidden'}`}
          />
          {!videoUrl && !recording && (
            <>
              <p className="text-sm font-medium">
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-500" />
                Record Video Application
              </p>
              <p className="mt-1 text-xs text-gray-400">Just be yourself</p>
            </>
          )}
          {videoError && <p className="mt-3 text-xs text-red-500">{videoError}</p>}
          <div className="mt-6 flex items-center gap-4">
            {recording ? (
              <button type="button" onClick={stopRecording} className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow">
                <span className="h-4 w-4 rounded-sm bg-white" />
              </button>
            ) : (
              <button type="button" onClick={startRecording} className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow" aria-label="Record video">
                <span className="h-5 w-5 rounded-full bg-white" />
              </button>
            )}
            <span className="text-sm text-gray-500">{clock}</span>
            <button type="button" onClick={cancelRecording} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-white" aria-label="Cancel recording">
              ×
            </button>
          </div>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-red-500">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {submitting ? 'Saving…' : 'Submit application'}
      </button>
    </form>
  )
}
