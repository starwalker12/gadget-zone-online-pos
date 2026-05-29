"use client";

import type { ReactNode } from "react";
import { useActionState, useState } from "react";
import type { BrandingSettings } from "@/lib/data/settings";
import { updateSettingsAction, updateProfilePictureAction, type SettingsActionState, type SettingsIntent } from "./actions";
import { ImageUpload } from "@/components/shared/image-upload";
import { ImageIcon } from "lucide-react";

const initialState: SettingsActionState = { error: null, success: null };

const inputClass =
  "mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500";
const textareaClass =
  "mt-1 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-600 disabled:bg-slate-50 disabled:text-slate-500";
const labelClass = "block min-w-0";
const labelTextClass = "text-xs font-bold uppercase tracking-wide text-slate-500";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function BlockSaveButton({
  pending,
  canEdit,
  label = "Save",
}: {
  pending: boolean;
  canEdit: boolean;
  label?: string;
}) {
  return (
    <button
      type="submit"
      disabled={!canEdit || pending}
      className="mt-4 h-10 rounded-lg bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:opacity-60"
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

function BlockMessage({ state }: { state: SettingsActionState }) {
  return (
    <>
      {state.success && (
        <p className="mt-3 text-xs font-semibold text-emerald-600">{state.success}</p>
      )}
      {state.error && (
        <p className="mt-3 text-xs font-semibold text-red-600">{state.error}</p>
      )}
    </>
  );
}

export function SettingsForm({
  settings,
  canEdit,
  organizationId,
  branchId,
  userId,
  profilePictureUrl,
}: {
  settings: BrandingSettings;
  canEdit: boolean;
  organizationId: string;
  branchId: string | null;
  userId: string;
  profilePictureUrl?: string | null;
}) {
  const [bpState, bpAction, bpPending] = useActionState(updateSettingsAction, initialState);
  const [logoState, logoAction, logoPending] = useActionState(updateSettingsAction, initialState);
  const [brState, brAction, brPending] = useActionState(updateSettingsAction, initialState);
  const [invState, invAction, invPending] = useActionState(updateSettingsAction, initialState);
  const [thState, thAction, thPending] = useActionState(updateSettingsAction, initialState);
  const [regState, regAction, regPending] = useActionState(updateSettingsAction, initialState);
  const [ppState, ppAction] = useActionState(updateProfilePictureAction, initialState);

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState(settings.logoUrl ?? "");
  const [appLogoUrlInput, setAppLogoUrlInput] = useState(settings.appLogoUrl ?? "");

  const DEFAULT_LOGO = "/saledock-logo-full.png";
  const effectiveLogoUrl = logoPreview || settings.logoUrl || DEFAULT_LOGO;
  const isDefaultLogo = !logoPreview && (!settings.logoUrl || settings.logoUrl === DEFAULT_LOGO);

  function handleLogoUpload(url: string) {
    setLogoPreview(url);
    setLogoError(false);
    setLogoUrlInput(url);
  }

  function handleLogoRemove() {
    setLogoPreview(null);
    setLogoError(false);
    setLogoUrlInput("");
  }

  function handleLogoError() {
    if (!logoError) setLogoError(true);
  }

  function handleAppLogoUpload(url: string) {
    setAppLogoUrlInput(url);
  }

  function handleAppLogoRemove() {
    setAppLogoUrlInput("");
  }

  function makeAction(intent: SettingsIntent) {
    return (formData: FormData) => {
      formData.set("intent", intent);
      const actions: Record<SettingsIntent, typeof bpAction> = {
        business_profile: bpAction,
        app_logo: logoAction,
        branch_profile: brAction,
        invoice_branding: invAction,
        theme: thAction,
        regional: regAction,
      };
      actions[intent](formData);
    };
  }

  return (
    <div className="space-y-5">
      {/* Business Profile */}
      <Section
        title="Business Profile"
        description="Primary shop details used in app headers, print documents, and future sharing."
      >
        <form action={makeAction("business_profile")}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              <span className={labelTextClass}>Shop name</span>
              <input name="shopName" required defaultValue={settings.shopName} disabled={!canEdit || bpPending} className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Owner name</span>
              <input name="ownerName" defaultValue={settings.ownerName} disabled={!canEdit || bpPending} className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Phone</span>
              <input name="phone" defaultValue={settings.phone} disabled={!canEdit || bpPending} className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>WhatsApp support</span>
              <input name="whatsappSupport" defaultValue={settings.whatsappSupport} disabled={!canEdit || bpPending} className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Email</span>
              <input name="email" type="email" defaultValue={settings.email} disabled={!canEdit || bpPending} className={inputClass} />
            </label>
            <label className="block min-w-0 md:col-span-2">
              <span className={labelTextClass}>Address</span>
              <textarea name="address" defaultValue={settings.address} disabled={!canEdit || bpPending} className={textareaClass} />
            </label>
          </div>
          <BlockSaveButton pending={bpPending} canEdit={canEdit} label="Save business profile" />
          <BlockMessage state={bpState} />
        </form>

        {/* App / Shop Logo — inline sub-form inside same section */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <form action={makeAction("app_logo")}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">App / Shop Logo</p>
            <p className="mt-1 text-xs text-slate-400">Shown in the app sidebar/header next to the SaleDock logo.</p>
            <input type="hidden" name="appLogoUrl" value={appLogoUrlInput} />
            <div className="mt-3">
              <ImageUpload
                key={`app-logo-${settings.appLogoUrl || 'empty'}`}
                bucket="public-branding"
                folderPath={`orgs/${organizationId}/app-logo`}
                currentUrl={settings.appLogoUrl || null}
                onUploadComplete={handleAppLogoUpload}
                onRemove={handleAppLogoRemove}
                aspectRatio="landscape"
                uploadingText="Uploading logo..."
                removeLabel="Remove shop logo"
              />
            </div>
            <BlockSaveButton pending={logoPending} canEdit={canEdit} label="Save shop logo" />
            <BlockMessage state={logoState} />
          </form>
        </div>
      </Section>

      {/* Branch Profile */}
      <Section
        title="Branch Profile"
        description="Branch-level name and contact details shown on invoices, repair receipts, and reports."
      >
        <form action={makeAction("branch_profile")}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={labelClass}>
              <span className={labelTextClass}>Branch name</span>
              <input name="branchName" required defaultValue={settings.branchName} disabled={!canEdit || brPending} className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Branch phone</span>
              <input name="branchPhone" defaultValue={settings.branchPhone} disabled={!canEdit || brPending} className={inputClass} />
            </label>
            <label className="block min-w-0 md:col-span-2">
              <span className={labelTextClass}>Branch address</span>
              <textarea name="branchAddress" defaultValue={settings.branchAddress} disabled={!canEdit || brPending} className={textareaClass} />
            </label>
          </div>
          <BlockSaveButton pending={brPending} canEdit={canEdit} label="Save branch profile" />
          <BlockMessage state={brState} />
        </form>
      </Section>

      {/* Invoice & Receipt Branding */}
      <Section
        title="Invoice & Receipt Branding"
        description="Branding fields used by invoice prints, repair receipts, and reports."
      >
        <form action={makeAction("invoice_branding")}>
          <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex aspect-square items-center justify-center rounded-xl bg-white p-5">
                {logoError ? (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="size-10 text-slate-300" />
                    <span className="text-xs text-slate-400">Preview unavailable</span>
                    <span className="text-[10px] text-slate-400 text-center leading-tight">Upload a new image or remove it.</span>
                  </div>
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={effectiveLogoUrl}
                    src={effectiveLogoUrl}
                    alt="Invoice logo preview"
                    className="h-auto max-h-28 w-auto object-contain"
                    onError={handleLogoError}
                  />
                )}
              </div>
              {isDefaultLogo && (
                <p className="mt-2 text-center text-[10px] text-slate-400">
                  Using default SaleDock logo
                </p>
              )}
              <div className="mt-3 space-y-2">
                <ImageUpload
                  key={`invoice-logo-${logoUrlInput || 'empty'}`}
                  bucket="public-branding"
                  folderPath={`orgs/${organizationId}/logo`}
                  currentUrl={null}
                  onUploadComplete={handleLogoUpload}
                  onRemove={handleLogoRemove}
                  aspectRatio="landscape"
                  uploadingText="Uploading logo..."
                  removeLabel="Remove logo"
                />
              </div>
            </div>
            <div className="grid gap-4">
              <label className={labelClass}>
                <span className={labelTextClass}>Logo URL or path</span>
                <input name="logoUrl" value={logoUrlInput} onChange={(e) => setLogoUrlInput(e.target.value)} disabled={!canEdit || invPending} className={inputClass} />
              </label>
              <label className={labelClass}>
                <span className={labelTextClass}>Invoice footer / note</span>
                <textarea name="invoiceFooter" defaultValue={settings.invoiceFooter} disabled={!canEdit || invPending} className={textareaClass} />
              </label>
              <label className={labelClass}>
                <span className={labelTextClass}>Repair receipt terms</span>
                <textarea name="receiptTerms" defaultValue={settings.receiptTerms} disabled={!canEdit || invPending} className={textareaClass} />
              </label>
              <label className={labelClass}>
                <span className={labelTextClass}>Default print format</span>
                <select name="printFormat" defaultValue={settings.printFormat} disabled={!canEdit || invPending} className={inputClass}>
                  <option value="a4">A4 default</option>
                  <option value="80mm_planned">80mm planned / deferred</option>
                </select>
              </label>
            </div>
          </div>
          <BlockSaveButton pending={invPending} canEdit={canEdit} label="Save invoice branding" />
          <BlockMessage state={invState} />
        </form>
      </Section>

      {/* Theme & Appearance */}
      <Section
        title="Theme & Appearance"
        description="Custom brand colors and default theme mode for your shop."
      >
        <form action={makeAction("theme")}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className={labelClass}>
              <span className={labelTextClass}>Primary color</span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  name="primaryColor"
                  defaultValue={settings.primaryColor ?? "#3B82F6"}
                  disabled={!canEdit || thPending}
                  className="h-11 w-14 rounded-lg border border-slate-200 p-1 cursor-pointer"
                />
                <input
                  name="primaryColor"
                  defaultValue={settings.primaryColor ?? "#3B82F6"}
                  disabled={!canEdit || thPending}
                  className={inputClass}
                  placeholder="#3B82F6"
                  maxLength={7}
                />
              </div>
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Accent color</span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  name="accentColor"
                  defaultValue={settings.accentColor ?? "#10B981"}
                  disabled={!canEdit || thPending}
                  className="h-11 w-14 rounded-lg border border-slate-200 p-1 cursor-pointer"
                />
                <input
                  name="accentColor"
                  defaultValue={settings.accentColor ?? "#10B981"}
                  disabled={!canEdit || thPending}
                  className={inputClass}
                  placeholder="#10B981"
                  maxLength={7}
                />
              </div>
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Default theme</span>
              <select
                name="defaultTheme"
                defaultValue={settings.defaultTheme ?? "system"}
                disabled={!canEdit || thPending}
                className={inputClass}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
          </div>
          <BlockSaveButton pending={thPending} canEdit={canEdit} label="Save theme" />
          <BlockMessage state={thState} />
        </form>
      </Section>

      {/* Profile Picture */}
      <Section
        title="Profile Picture"
        description="Your profile photo shown in the app header and staff list."
      >
        <form
          action={(formData: FormData) => {
            ppAction(formData);
          }}
        >
          <input type="hidden" name="profilePictureUrl" value="" />
          <div className="flex items-start gap-4">
            <ImageUpload
              key={`profile-pic-${profilePictureUrl || 'none'}`}
              bucket="profile-pictures"
              folderPath={`users/${userId}/profile-picture`}
              currentUrl={profilePictureUrl || null}
              onUploadComplete={(url) => {
                const fd = new FormData();
                fd.append("profilePictureUrl", url);
                ppAction(fd);
              }}
              onRemove={() => {
                const fd = new FormData();
                fd.append("profilePictureUrl", "");
                ppAction(fd);
              }}
              label="Profile picture"
              aspectRatio="square"
              removeLabel="Remove photo"
            />
          </div>
          {ppState.success && (
            <p className="mt-3 text-xs font-semibold text-emerald-600">{ppState.success}</p>
          )}
          {ppState.error && (
            <p className="mt-3 text-xs font-semibold text-red-600">{ppState.error}</p>
          )}
        </form>
      </Section>

      {/* Regional / Currency */}
      <Section
        title="Regional / Currency"
        description="Regional defaults for money formatting, reporting, and future branch operations."
      >
        <form action={makeAction("regional")}>
          <div className="grid gap-4 md:grid-cols-3">
            <label className={labelClass}>
              <span className={labelTextClass}>Currency</span>
              <input name="currencyCode" defaultValue={settings.currencyCode || "PKR"} disabled={!canEdit || regPending} className={inputClass} />
            </label>
            <label className="block min-w-0 md:col-span-2">
              <span className={labelTextClass}>Timezone</span>
              <input name="timezone" defaultValue={settings.timezone || "Asia/Karachi"} disabled={!canEdit || regPending} className={inputClass} />
            </label>
            <label className={labelClass}>
              <span className={labelTextClass}>Low-stock default threshold</span>
              <input
                name="lowStockDefaultThreshold"
                type="number"
                min={0}
                defaultValue={settings.lowStockDefaultThreshold}
                disabled={!canEdit || regPending}
                className={inputClass}
              />
            </label>
          </div>
          <BlockSaveButton pending={regPending} canEdit={canEdit} label="Save regional settings" />
          <BlockMessage state={regState} />
        </form>
      </Section>

      {/* System Info / Safe Notes */}
      <Section
        title="System Info / Safe Notes"
        description="Reference details for support. IDs are shown for troubleshooting only."
      >
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className={labelTextClass}>Production URL</dt>
            <dd className="mt-1 break-words font-semibold text-slate-800">https://saledock-cloud-pos.vercel.app</dd>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className={labelTextClass}>Uploads/storage</dt>
            <dd className="mt-1 font-semibold text-slate-800">Enabled via Supabase Storage (profile-pictures, public-branding buckets).</dd>
          </div>
          <details className="rounded-xl bg-slate-50 p-3 md:col-span-2">
            <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-slate-500">Technical IDs</summary>
            <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
              <p className="break-all">Organization: {organizationId}</p>
              <p className="break-all">Branch: {branchId ?? "None"}</p>
            </div>
          </details>
        </dl>
      </Section>
    </div>
  );
}
