import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Camera,
  Save,
  Plus,
  Trash2,
  MapPin,
  Globe,
  Clock,
  Briefcase,
  GraduationCap,
  Award,
  Phone,
  Link as LinkIcon,
  Languages,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  User,
} from 'lucide-react'
import { cn } from '@shared/utils/cn'
import { Header } from '@presentation/components/layout/TopBar'
import { PageContainer } from '@presentation/components/layout/PageContainer'
import { useProfile, useUpdateProfile, useUploadPhoto } from '@application/hooks/useUsers'
import type {
  User as UserModel,
  Phone as PhoneType,
  Certification,
  ProfessionalExperience,
  Education,
  SocialLink,
  Language,
  LanguageProficiency,
} from '@domain/models/user'

/* ── Section wrapper ── */
interface SectionProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  collapsible?: boolean
  defaultOpen?: boolean
}

function Section({ title, icon: Icon, children, collapsible = false, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-card">
      <button
        type="button"
        onClick={collapsible ? () => setOpen(!open) : undefined}
        className={cn(
          'flex w-full items-center gap-3 px-5 py-4',
          collapsible && 'cursor-pointer hover:bg-muted/30',
        )}
        aria-expanded={open}
        disabled={!collapsible}
      >
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="flex-1 text-left text-base font-semibold text-text">{title}</h2>
        {collapsible && (open ? <ChevronUp className="h-4 w-4 text-text-muted" /> : <ChevronDown className="h-4 w-4 text-text-muted" />)}
      </button>
      {open && <div className="border-t border-border px-5 py-4">{children}</div>}
    </div>
  )
}

/* ── Field wrapper ── */
interface FieldProps {
  label: string
  htmlFor?: string
  children: React.ReactNode
  hint?: string
}
function Field({ label, htmlFor, children, hint }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-text">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

/* ── Common languages for autocomplete ── */
const COMMON_LANGUAGES = [
  'Português (BR)', 'Português (PT)', 'Inglês', 'Espanhol', 'Francês',
  'Alemão', 'Italiano', 'Japonês', 'Coreano', 'Mandarim',
  'Cantonês', 'Árabe', 'Hindi', 'Russo', 'Polonês',
  'Holandês', 'Sueco', 'Norueguês', 'Dinamarquês', 'Finlandês',
  'Turco', 'Grego', 'Hebraico', 'Tailandês', 'Vietnamita',
  'Indonésio', 'Malaio', 'Tcheco', 'Húngaro', 'Romeno',
  'Ucraniano', 'Catalão', 'Basco', 'Galego', 'Guarani',
  'Quéchua', 'Libras', 'ASL', 'Língua de Sinais',
]

/* ── Autocomplete input ── */
interface AutocompleteInputProps {
  value: string
  onChange: (v: string) => void
  suggestions: string[]
  placeholder?: string
  className?: string
}
function AutocompleteInput({ value, onChange, suggestions, placeholder, className }: AutocompleteInputProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = value.trim()
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase().trim()))
    : []
  const showDropdown = open && filtered.length > 0

  useEffect(() => {
    setActiveIndex(-1)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement | undefined
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i < filtered.length - 1 ? i + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i > 0 ? i - 1 : filtered.length - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      onChange(filtered[activeIndex])
      setOpen(false)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-activedescendant={activeIndex >= 0 ? `lang-option-${activeIndex}` : undefined}
      />
      {showDropdown && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-[var(--radius-md)] border border-border bg-card shadow-lg"
        >
          {filtered.map((item, i) => (
            <li
              key={item}
              id={`lang-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => { onChange(item); setOpen(false) }}
              className={cn(
                'cursor-pointer px-3 py-2 text-sm',
                i === activeIndex ? 'bg-primary/10 text-primary' : 'text-text hover:bg-muted/50',
              )}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── Tag input ── */
interface TagInputProps {
  value: string[]
  onChange: (v: string[]) => void
  placeholder: string
  ariaLabel: string
}
function TagInput({ value, onChange, placeholder, ariaLabel }: TagInputProps) {
  const [input, setInput] = useState('')
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      if (!value.includes(input.trim())) {
        onChange([...value, input.trim()])
      }
      setInput('')
    }
    if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }
  return (
    <div className="flex flex-wrap gap-1.5 rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2">
      {value.map((tag) => (
        <span key={tag} className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {tag}
          <button type="button" onClick={() => onChange(value.filter((v) => v !== tag))} className="hover:text-error" aria-label={`Remove ${tag}`}>
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ''}
        className="min-w-[120px] flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
        aria-label={ariaLabel}
      />
    </div>
  )
}

/* ══════════════════════════════════════════════
 *  Profile Form (inner component — remounts when data changes via key)
 * ══════════════════════════════════════════════ */
interface ProfileFormProps {
  userData: UserModel
}

function ProfileForm({ userData }: ProfileFormProps) {
  const { t } = useTranslation()
  const updateProfileMutation = useUpdateProfile()
  const uploadPhotoMutation = useUploadPhoto()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const p = userData.profile

  // Form state — initialized from server data (component remounts via key when data changes)
  const [photoUrl, setPhotoUrl] = useState(p?.photoUrl ?? null)
  const [bio, setBio] = useState(p?.bio ?? '')
  const [location, setLocation] = useState(p?.location ?? '')
  const [timezone, setTimezone] = useState(p?.timezone ?? '')
  const [languages, setLanguages] = useState<Omit<Language, 'id'>[]>(
    (p?.languages ?? []).map(({ name, proficiency, certifications }) => ({ name, proficiency, certifications })),
  )
  const [skills, setSkills] = useState(p?.skills ?? [])
  const [availabilityHours, setAvailabilityHours] = useState(p?.availabilityHoursPerWeek?.toString() ?? '')
  const [phones, setPhones] = useState<Omit<PhoneType, 'id'>[]>(
    (p?.phones ?? []).map(({ type, number, isPrimary }) => ({ type, number, isPrimary })),
  )
  const [certifications, setCertifications] = useState<Omit<Certification, 'id'>[]>(
    (p?.certifications ?? []).map(({ name, issuer, issueDate, expirationDate, credentialUrl }) => ({ name, issuer, issueDate, expirationDate, credentialUrl })),
  )
  const [experience, setExperience] = useState<Omit<ProfessionalExperience, 'id'>[]>(
    (p?.experience ?? []).map(({ company, role, startDate, endDate, current, description }) => ({ company, role, startDate, endDate, current, description })),
  )
  const [education, setEducation] = useState<Omit<Education, 'id'>[]>(
    (p?.education ?? []).map(({ institution, degree, field, startDate, endDate, current }) => ({ institution, degree, field, startDate, endDate, current })),
  )
  const [socialLinks, setSocialLinks] = useState<Omit<SocialLink, 'id'>[]>(
    (p?.socialLinks ?? []).map(({ type, url, label }) => ({ type, url, label })),
  )

  const [saveSuccess, setSaveSuccess] = useState(false)

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await uploadPhotoMutation.mutateAsync(file)
      setPhotoUrl(result.photoUrl)
    } catch {
      // handled by mutation
    }
  }, [uploadPhotoMutation])

  const handleSave = useCallback(async () => {
    try {
      await updateProfileMutation.mutateAsync({
        photoUrl,
        phones,
        bio: bio || null,
        location: location || null,
        timezone: timezone || null,
        languages,
        skills,
        certifications,
        experience,
        education,
        socialLinks,
        availabilityHoursPerWeek: availabilityHours ? parseInt(availabilityHours, 10) : null,
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      // handled by mutation
    }
  }, [updateProfileMutation, photoUrl, phones, bio, location, timezone, languages, skills, certifications, experience, education, socialLinks, availabilityHours])

  // Helper: update item in array
  const updateArrayItem = <T,>(arr: T[], index: number, patch: Partial<T>): T[] =>
    arr.map((item, i) => (i === index ? { ...item, ...patch } : item))

  const removeArrayItem = <T,>(arr: T[], index: number): T[] =>
    arr.filter((_, i) => i !== index)

  const inputClass = 'w-full rounded-[var(--radius-md)] border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <div className="flex flex-col gap-6">
      {/* Save success toast */}
      {saveSuccess && (
        <div className="rounded-[var(--radius-md)] border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          {t('profilePage.saveSuccess')}
        </div>
      )}

            {/* ── Photo + Basic Info ── */}
            <Section title={t('profilePage.sections.basicInfo')} icon={User}>
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                {/* Photo */}
                <div className="relative shrink-0">
                  <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-primary/20 bg-muted">
                    {photoUrl ? (
                      <img src={photoUrl} alt={userData.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-primary">
                        {userData.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 rounded-full border-2 border-card bg-primary p-2 text-white hover:bg-primary-dark"
                    aria-label={t('profilePage.changePhoto')}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" aria-label={t('profilePage.changePhoto')} />
                </div>

                {/* Name + Email (read-only) + Bio */}
                <div className="flex flex-1 flex-col gap-4 w-full">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label={t('profilePage.fields.name')}>
                      <input type="text" value={userData.name} disabled className={cn(inputClass, 'bg-muted cursor-not-allowed')} />
                    </Field>
                    <Field label={t('profilePage.fields.email')}>
                      <input type="text" value={userData.email} disabled className={cn(inputClass, 'bg-muted cursor-not-allowed')} />
                    </Field>
                  </div>
                  <Field label={t('profilePage.fields.bio')} htmlFor="bio" hint={t('profilePage.fields.bioHint')}>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder={t('profilePage.fields.bioPlaceholder')}
                      className={cn(inputClass, 'resize-none')}
                      maxLength={500}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* ── Location & Availability ── */}
            <Section title={t('profilePage.sections.locationAvailability')} icon={MapPin}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field label={t('profilePage.fields.location')} htmlFor="location">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input id="location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t('profilePage.fields.locationPlaceholder')} className={cn(inputClass, 'pl-9')} />
                  </div>
                </Field>
                <Field label={t('profilePage.fields.timezone')} htmlFor="timezone">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <select id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} className={cn(inputClass, 'pl-9')}>
                      <option value="">{t('profilePage.fields.selectTimezone')}</option>
                      <option value="America/Sao_Paulo">América/São Paulo (BRT)</option>
                      <option value="America/Manaus">América/Manaus (AMT)</option>
                      <option value="America/Belem">América/Belém (BRT)</option>
                      <option value="America/Fortaleza">América/Fortaleza (BRT)</option>
                      <option value="America/New_York">América/New York (EST)</option>
                      <option value="Europe/London">Europa/Londres (GMT)</option>
                      <option value="Europe/Lisbon">Europa/Lisboa (WET)</option>
                    </select>
                  </div>
                </Field>
                <Field label={t('profilePage.fields.availability')} htmlFor="availability" hint={t('profilePage.fields.availabilityHint')}>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <input id="availability" type="number" min="0" max="80" value={availabilityHours} onChange={(e) => setAvailabilityHours(e.target.value)} placeholder="40" className={cn(inputClass, 'pl-9')} />
                  </div>
                </Field>
              </div>
            </Section>

            {/* ── Phones ── */}
            <Section title={t('profilePage.sections.phones')} icon={Phone} collapsible defaultOpen={phones.length > 0}>
              <div className="flex flex-col gap-3">
                {phones.map((phone, idx) => (
                  <div key={idx} className="flex flex-wrap items-end gap-3">
                    <Field label={t('profilePage.fields.phoneType')}>
                      <select
                        value={phone.type}
                        onChange={(e) => setPhones(updateArrayItem(phones, idx, { type: e.target.value as PhoneType['type'] }))}
                        className={cn(inputClass, 'w-32')}
                      >
                        <option value="mobile">{t('profilePage.phoneTypes.mobile')}</option>
                        <option value="work">{t('profilePage.phoneTypes.work')}</option>
                        <option value="home">{t('profilePage.phoneTypes.home')}</option>
                      </select>
                    </Field>
                    <Field label={t('profilePage.fields.phoneNumber')}>
                      <input
                        type="tel"
                        value={phone.number}
                        onChange={(e) => setPhones(updateArrayItem(phones, idx, { number: e.target.value }))}
                        placeholder="+55 11 99999-9999"
                        className={cn(inputClass, 'w-48')}
                      />
                    </Field>
                    <label className="flex items-center gap-2 pb-2 text-sm text-text-muted">
                      <input
                        type="checkbox"
                        checked={phone.isPrimary}
                        onChange={(e) => setPhones(phones.map((p, i) => ({ ...p, isPrimary: i === idx ? e.target.checked : false })))}
                        className="rounded border-border"
                      />
                      {t('profilePage.fields.primary')}
                    </label>
                    <button type="button" onClick={() => setPhones(removeArrayItem(phones, idx))} className="mb-2 rounded-[var(--radius-md)] p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600" aria-label={t('common.delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setPhones([...phones, { type: 'mobile', number: '', isPrimary: phones.length === 0 }])}
                  className="flex items-center gap-1.5 self-start rounded-[var(--radius-md)] border border-dashed border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('profilePage.addPhone')}
                </button>
              </div>
            </Section>

            {/* ── Languages ── */}
            <Section title={t('profilePage.sections.languages')} icon={Languages} collapsible defaultOpen={languages.length > 0}>
              <div className="flex flex-col gap-4">
                {languages.map((lang, idx) => (
                  <div key={idx} className="relative rounded-[var(--radius-md)] border border-border p-4">
                    <button type="button" onClick={() => setLanguages(removeArrayItem(languages, idx))} className="absolute right-3 top-3 rounded-[var(--radius-md)] p-1 text-text-muted hover:bg-red-50 hover:text-red-600" aria-label={t('common.delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label={t('profilePage.fields.languageName')}>
                        <AutocompleteInput
                          value={lang.name}
                          onChange={(v) => setLanguages(updateArrayItem(languages, idx, { name: v }))}
                          suggestions={COMMON_LANGUAGES}
                          placeholder={t('profilePage.fields.languageNamePlaceholder')}
                          className={inputClass}
                        />
                      </Field>
                      <Field label={t('profilePage.fields.languageProficiency')}>
                        <select value={lang.proficiency} onChange={(e) => setLanguages(updateArrayItem(languages, idx, { proficiency: e.target.value as LanguageProficiency }))} className={inputClass}>
                          <option value="">{t('profilePage.fields.selectProficiency')}</option>
                          <option value="basic">{t('profilePage.proficiencyLevels.basic')}</option>
                          <option value="intermediate">{t('profilePage.proficiencyLevels.intermediate')}</option>
                          <option value="advanced">{t('profilePage.proficiencyLevels.advanced')}</option>
                          <option value="fluent">{t('profilePage.proficiencyLevels.fluent')}</option>
                          <option value="native">{t('profilePage.proficiencyLevels.native')}</option>
                        </select>
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label={t('profilePage.fields.languageCertifications')}>
                          <TagInput
                            value={lang.certifications}
                            onChange={(certs) => setLanguages(updateArrayItem(languages, idx, { certifications: certs }))}
                            placeholder={t('profilePage.fields.languageCertificationsPlaceholder')}
                            ariaLabel={t('profilePage.fields.languageCertifications')}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setLanguages([...languages, { name: '', proficiency: 'basic', certifications: [] }])}
                  className="flex items-center gap-1.5 self-start rounded-[var(--radius-md)] border border-dashed border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('profilePage.addLanguage')}
                </button>
              </div>
            </Section>

            {/* ── Skills ── */}
            <Section title={t('profilePage.sections.skills')} icon={Sparkles}>
              <TagInput value={skills} onChange={setSkills} placeholder={t('profilePage.fields.skillsPlaceholder')} ariaLabel={t('profilePage.sections.skills')} />
            </Section>

            {/* ── Certifications ── */}
            <Section title={t('profilePage.sections.certifications')} icon={Award} collapsible defaultOpen={certifications.length > 0}>
              <div className="flex flex-col gap-4">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="relative rounded-[var(--radius-md)] border border-border p-4">
                    <button type="button" onClick={() => setCertifications(removeArrayItem(certifications, idx))} className="absolute right-3 top-3 rounded-[var(--radius-md)] p-1 text-text-muted hover:bg-red-50 hover:text-red-600" aria-label={t('common.delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label={t('profilePage.fields.certName')}>
                        <input type="text" value={cert.name} onChange={(e) => setCertifications(updateArrayItem(certifications, idx, { name: e.target.value }))} placeholder={t('profilePage.fields.certNamePlaceholder')} className={inputClass} />
                      </Field>
                      <Field label={t('profilePage.fields.certIssuer')}>
                        <input type="text" value={cert.issuer} onChange={(e) => setCertifications(updateArrayItem(certifications, idx, { issuer: e.target.value }))} placeholder={t('profilePage.fields.certIssuerPlaceholder')} className={inputClass} />
                      </Field>
                      <Field label={t('profilePage.fields.issueDate')}>
                        <input type="date" value={cert.issueDate} onChange={(e) => setCertifications(updateArrayItem(certifications, idx, { issueDate: e.target.value }))} className={inputClass} />
                      </Field>
                      <Field label={t('profilePage.fields.expirationDate')}>
                        <input type="date" value={cert.expirationDate ?? ''} onChange={(e) => setCertifications(updateArrayItem(certifications, idx, { expirationDate: e.target.value || null }))} className={inputClass} />
                      </Field>
                      <Field label={t('profilePage.fields.credentialUrl')}>
                        <input type="url" value={cert.credentialUrl ?? ''} onChange={(e) => setCertifications(updateArrayItem(certifications, idx, { credentialUrl: e.target.value || null }))} placeholder="https://" className={cn(inputClass, 'sm:col-span-2')} />
                      </Field>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setCertifications([...certifications, { name: '', issuer: '', issueDate: '', expirationDate: null, credentialUrl: null }])}
                  className="flex items-center gap-1.5 self-start rounded-[var(--radius-md)] border border-dashed border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('profilePage.addCertification')}
                </button>
              </div>
            </Section>

            {/* ── Professional Experience ── */}
            <Section title={t('profilePage.sections.experience')} icon={Briefcase} collapsible defaultOpen={experience.length > 0}>
              <div className="flex flex-col gap-4">
                {experience.map((exp, idx) => (
                  <div key={idx} className="relative rounded-[var(--radius-md)] border border-border p-4">
                    <button type="button" onClick={() => setExperience(removeArrayItem(experience, idx))} className="absolute right-3 top-3 rounded-[var(--radius-md)] p-1 text-text-muted hover:bg-red-50 hover:text-red-600" aria-label={t('common.delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label={t('profilePage.fields.company')}>
                        <input type="text" value={exp.company} onChange={(e) => setExperience(updateArrayItem(experience, idx, { company: e.target.value }))} placeholder={t('profilePage.fields.companyPlaceholder')} className={inputClass} />
                      </Field>
                      <Field label={t('profilePage.fields.role')}>
                        <input type="text" value={exp.role} onChange={(e) => setExperience(updateArrayItem(experience, idx, { role: e.target.value }))} placeholder={t('profilePage.fields.rolePlaceholder')} className={inputClass} />
                      </Field>
                      <Field label={t('profilePage.fields.startDate')}>
                        <input type="date" value={exp.startDate} onChange={(e) => setExperience(updateArrayItem(experience, idx, { startDate: e.target.value }))} className={inputClass} />
                      </Field>
                      <Field label={t('profilePage.fields.endDate')}>
                        <input type="date" value={exp.endDate ?? ''} onChange={(e) => setExperience(updateArrayItem(experience, idx, { endDate: e.target.value || null }))} disabled={exp.current} className={cn(inputClass, exp.current && 'bg-muted cursor-not-allowed')} />
                      </Field>
                      <label className="flex items-center gap-2 text-sm text-text-muted sm:col-span-2">
                        <input type="checkbox" checked={exp.current} onChange={(e) => setExperience(updateArrayItem(experience, idx, { current: e.target.checked, endDate: e.target.checked ? null : exp.endDate }))} className="rounded border-border" />
                        {t('profilePage.fields.currentPosition')}
                      </label>
                      <Field label={t('profilePage.fields.description')}>
                        <textarea value={exp.description} onChange={(e) => setExperience(updateArrayItem(experience, idx, { description: e.target.value }))} rows={2} placeholder={t('profilePage.fields.descriptionPlaceholder')} className={cn(inputClass, 'resize-none sm:col-span-2')} />
                      </Field>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setExperience([...experience, { company: '', role: '', startDate: '', endDate: null, current: false, description: '' }])}
                  className="flex items-center gap-1.5 self-start rounded-[var(--radius-md)] border border-dashed border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('profilePage.addExperience')}
                </button>
              </div>
            </Section>

            {/* ── Education ── */}
            <Section title={t('profilePage.sections.education')} icon={GraduationCap} collapsible defaultOpen={education.length > 0}>
              <div className="flex flex-col gap-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="relative rounded-[var(--radius-md)] border border-border p-4">
                    <button type="button" onClick={() => setEducation(removeArrayItem(education, idx))} className="absolute right-3 top-3 rounded-[var(--radius-md)] p-1 text-text-muted hover:bg-red-50 hover:text-red-600" aria-label={t('common.delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label={t('profilePage.fields.institution')}>
                        <input type="text" value={edu.institution} onChange={(e) => setEducation(updateArrayItem(education, idx, { institution: e.target.value }))} placeholder={t('profilePage.fields.institutionPlaceholder')} className={inputClass} />
                      </Field>
                      <Field label={t('profilePage.fields.degree')}>
                        <select value={edu.degree} onChange={(e) => setEducation(updateArrayItem(education, idx, { degree: e.target.value }))} className={inputClass}>
                          <option value="">{t('profilePage.fields.selectDegree')}</option>
                          <option value="Técnico">{t('profilePage.degrees.technical')}</option>
                          <option value="Bacharelado">{t('profilePage.degrees.bachelor')}</option>
                          <option value="Licenciatura">{t('profilePage.degrees.licentiate')}</option>
                          <option value="Pós-Graduação">{t('profilePage.degrees.postGrad')}</option>
                          <option value="MBA">{t('profilePage.degrees.mba')}</option>
                          <option value="Mestrado">{t('profilePage.degrees.masters')}</option>
                          <option value="Doutorado">{t('profilePage.degrees.doctorate')}</option>
                        </select>
                      </Field>
                      <Field label={t('profilePage.fields.fieldOfStudy')}>
                        <input type="text" value={edu.field} onChange={(e) => setEducation(updateArrayItem(education, idx, { field: e.target.value }))} placeholder={t('profilePage.fields.fieldPlaceholder')} className={inputClass} />
                      </Field>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label={t('profilePage.fields.startDate')}>
                          <input type="date" value={edu.startDate} onChange={(e) => setEducation(updateArrayItem(education, idx, { startDate: e.target.value }))} className={inputClass} />
                        </Field>
                        <Field label={t('profilePage.fields.endDate')}>
                          <input type="date" value={edu.endDate ?? ''} onChange={(e) => setEducation(updateArrayItem(education, idx, { endDate: e.target.value || null }))} disabled={edu.current} className={cn(inputClass, edu.current && 'bg-muted cursor-not-allowed')} />
                        </Field>
                      </div>
                      <label className="flex items-center gap-2 text-sm text-text-muted sm:col-span-2">
                        <input type="checkbox" checked={edu.current} onChange={(e) => setEducation(updateArrayItem(education, idx, { current: e.target.checked, endDate: e.target.checked ? null : edu.endDate }))} className="rounded border-border" />
                        {t('profilePage.fields.currentlyStudying')}
                      </label>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setEducation([...education, { institution: '', degree: '', field: '', startDate: '', endDate: null, current: false }])}
                  className="flex items-center gap-1.5 self-start rounded-[var(--radius-md)] border border-dashed border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('profilePage.addEducation')}
                </button>
              </div>
            </Section>

            {/* ── Social Links ── */}
            <Section title={t('profilePage.sections.socialLinks')} icon={LinkIcon} collapsible defaultOpen={socialLinks.length > 0}>
              <div className="flex flex-col gap-3">
                {socialLinks.map((link, idx) => (
                  <div key={idx} className="flex flex-wrap items-end gap-3">
                    <Field label={t('profilePage.fields.linkType')}>
                      <select value={link.type} onChange={(e) => setSocialLinks(updateArrayItem(socialLinks, idx, { type: e.target.value as SocialLink['type'] }))} className={cn(inputClass, 'w-40')}>
                        <option value="linkedin">LinkedIn</option>
                        <option value="github">GitHub</option>
                        <option value="portfolio">{t('profilePage.linkTypes.portfolio')}</option>
                        <option value="other">{t('profilePage.linkTypes.other')}</option>
                      </select>
                    </Field>
                    <Field label={t('profilePage.fields.linkUrl')}>
                      <input type="url" value={link.url} onChange={(e) => setSocialLinks(updateArrayItem(socialLinks, idx, { url: e.target.value }))} placeholder="https://" className={cn(inputClass, 'w-64')} />
                    </Field>
                    <Field label={t('profilePage.fields.linkLabel')}>
                      <input type="text" value={link.label} onChange={(e) => setSocialLinks(updateArrayItem(socialLinks, idx, { label: e.target.value }))} placeholder={t('profilePage.fields.linkLabelPlaceholder')} className={cn(inputClass, 'w-32')} />
                    </Field>
                    <button type="button" onClick={() => setSocialLinks(removeArrayItem(socialLinks, idx))} className="mb-2 rounded-[var(--radius-md)] p-1.5 text-text-muted hover:bg-red-50 hover:text-red-600" aria-label={t('common.delete')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setSocialLinks([...socialLinks, { type: 'linkedin', url: '', label: '' }])}
                  className="flex items-center gap-1.5 self-start rounded-[var(--radius-md)] border border-dashed border-border px-3 py-1.5 text-xs font-medium text-text-muted hover:border-primary hover:text-primary"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('profilePage.addSocialLink')}
                </button>
              </div>
            </Section>

            {/* ── Save button (sticky) ── */}
            <div className="sticky bottom-4 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
                className="flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 py-2.5 text-sm font-medium text-white shadow-lg hover:bg-primary-dark disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {t('common.save')}
              </button>
            </div>
          </div>
  )
}

/* ══════════════════════════════════════════════
 *  User Profile Page (outer wrapper — loading, error, data)
 * ══════════════════════════════════════════════ */
function UserProfilePage() {
  const { t } = useTranslation()
  const { data: userData, isLoading, isError, refetch } = useProfile()

  return (
    <>
      <Header title={t('profilePage.title')} subtitle={t('profilePage.subtitle')} />
      <PageContainer>
        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-text-muted">{t('common.loading')}</span>
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-[var(--radius-lg)] border border-error-border bg-error-light p-8 text-center">
            <p className="text-sm text-error">{t('common.error')}</p>
            <button onClick={() => refetch()} className="mt-3 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark" type="button">
              {t('common.retry')}
            </button>
          </div>
        )}

        {/* Profile form — key ensures remount when data changes */}
        {!isLoading && !isError && userData && (
          <ProfileForm key={userData.updatedAt} userData={userData} />
        )}
      </PageContainer>
    </>
  )
}

export { UserProfilePage }
