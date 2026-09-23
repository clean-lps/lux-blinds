import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/server/auth/session';
import {AdminNav} from '@/components/admin/admin-nav';

export const metadata: Metadata = {title: 'LUX Blinds — Admin', description: 'LUX Blinds administration workspace'};

const ADMIN_STYLES = `
.admin-root{--admin-bg:#f2f3f0;--admin-sidebar:#181b1b;--admin-sidebar-muted:#a8b0ad;--admin-line:#d9ded9;--admin-line-soft:#e7eae6;--admin-focus:#2f715c;min-height:100vh;min-width:0;background:var(--admin-bg);color:#17201d;display:grid;grid-template-columns:248px minmax(0,1fr)}
.admin-sidebar{position:sticky;top:0;height:100vh;padding:28px 18px 20px;background:var(--admin-sidebar);color:#fff;display:flex;flex-direction:column;gap:24px}
.admin-sidebar-top{display:grid;gap:16px}
.admin-brand{display:flex;align-items:baseline;gap:8px;color:#fff;text-decoration:none;font-weight:800;letter-spacing:-.045em;font-size:23px;padding:0 10px}
.admin-brand span{font-size:11px;font-weight:650;letter-spacing:.14em;color:#aeb7b3}
.admin-sidebar-caption{display:flex;align-items:center;gap:8px;padding:0 10px;color:var(--admin-sidebar-muted);font-size:11px;letter-spacing:.06em;text-transform:uppercase}
.admin-status-dot{width:7px;height:7px;border-radius:50%;background:#6ec49a;box-shadow:0 0 0 3px #6ec49a26}
.admin-nav{display:grid;gap:4px}
.admin-nav a{position:relative;padding:12px 13px 12px 17px;border-radius:9px;color:#c8cfcc;text-decoration:none;font-size:14px;font-weight:650;transition:background-color 180ms ease,color 180ms ease,transform 180ms ease}
.admin-nav a::before{content:"";position:absolute;left:7px;top:50%;width:3px;height:18px;border-radius:3px;background:#75c09e;opacity:0;transform:translateY(-50%) scaleY(.5);transition:opacity 180ms ease,transform 180ms ease}
.admin-nav a:hover{background:#252b2a;color:#fff;transform:translateX(2px)}
.admin-nav a:focus-visible{background:#252b2a;color:#fff}
.admin-nav a[aria-current=page]{background:#f5f6f3;color:#17201d}
.admin-nav a[aria-current=page]::before{opacity:1;transform:translateY(-50%) scaleY(1)}
.admin-sidebar-note{margin-top:auto;padding:16px 10px 2px;border-top:1px solid #39423f;color:var(--admin-sidebar-muted);font-size:12px;line-height:1.5}
.admin-sidebar-note strong{display:block;color:#f5f6f3;margin-bottom:5px;font-size:12px}
.admin-workspace{min-width:0}
.admin-mobile-bar{display:none}
.admin-content{width:100%;min-width:0;max-width:1540px;margin:0 auto;padding:44px clamp(24px,4vw,68px) 72px}
.admin-page-header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:28px}
.admin-page-header h1{margin:0;font-size:40px;line-height:1.08;letter-spacing:-.032em;text-wrap:balance}
.admin-page-header p{max-width:68ch;margin:9px 0 0;color:#56625d}
.admin-kicker{margin:0 0 9px;color:#557267;font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
.admin-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap}
.admin-button{display:inline-flex;align-items:center;justify-content:center;min-height:42px;border:1px solid transparent;border-radius:9px;padding:9px 15px;background:#17201d;color:#fff;font:inherit;font-size:14px;font-weight:750;text-decoration:none;cursor:pointer;transition:background-color 180ms ease,border-color 180ms ease,color 180ms ease,opacity 180ms ease,transform 180ms ease}
.admin-button:hover{background:#2b3934;transform:translateY(-1px)}
.admin-button.secondary{background:#fff;color:#17201d;border-color:#cbd3ce}
.admin-button.secondary:hover{background:#f5f7f4;border-color:#aebdb5}
.admin-button.ghost{background:transparent;color:#171717;border-color:transparent;text-decoration:underline;text-underline-offset:3px}
.admin-button.danger{background:#9b2342}
.admin-button:disabled{opacity:.48;cursor:not-allowed;transform:none}
.admin-button:focus-visible,.admin-nav a:focus-visible,.admin-brand:focus-visible,.admin-link:focus-visible{outline:3px solid var(--admin-focus);outline-offset:3px}
.admin-hero{display:flex;align-items:center;justify-content:space-between;gap:28px;margin-bottom:20px;padding:25px 28px;background:#1c2522;color:#fff;border:1px solid #2a3732;border-radius:14px}
.admin-hero h2{margin:0;font-size:22px;line-height:1.2;letter-spacing:-.02em;text-wrap:balance}
.admin-hero p{max-width:62ch;margin:8px 0 0;color:#cad6d0}
.admin-hero .admin-badge{background:#2a3933;color:#e5f2eb;border-color:#48675a}
.admin-card{min-width:0;background:#fff;border:1px solid var(--admin-line);border-radius:13px;padding:24px;margin-bottom:20px}
.admin-card h2{margin:0;font-size:20px;line-height:1.25;letter-spacing:-.02em;text-wrap:balance}
.admin-card h3{margin:0;font-size:16px;line-height:1.3}
.admin-card p{max-width:75ch;margin:7px 0 0;color:#53605a}
.admin-card-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}
.admin-muted{color:#5f6b65!important}
.admin-toolbar{display:flex;align-items:end;gap:12px;flex-wrap:wrap;margin:20px 0}
.admin-toolbar .admin-field:first-child{flex:1 1 280px}
.admin-field{min-width:0;display:grid;gap:7px}
.admin-field label{font-size:12px;font-weight:750;color:#393632}
.admin-field input,.admin-field select,.admin-field textarea{width:100%;min-height:44px;border:1px solid #cbd3ce;border-radius:9px;padding:9px 12px;background:#fff;color:#17201d;font:inherit}
.admin-field textarea{min-height:104px;resize:vertical}
.admin-field input::placeholder,.admin-field textarea::placeholder{color:#66736c;opacity:1}
.admin-field input:focus-visible,.admin-field select:focus-visible,.admin-field textarea:focus-visible{outline:3px solid var(--admin-focus);outline-offset:2px;border-color:var(--admin-focus)}
.admin-field input[aria-invalid=true],.admin-field textarea[aria-invalid=true]{border-color:#9b2342}
.admin-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.admin-form-grid .full{grid-column:1/-1}
.admin-table-wrap{overflow-x:auto;contain:paint}
.admin-table{width:100%;border-collapse:collapse;min-width:760px;font-size:14px}
.admin-table th{padding:0 12px 12px;text-align:left;color:#65736c;font-size:10px;font-weight:850;letter-spacing:.09em;text-transform:uppercase;white-space:nowrap}
.admin-table td{padding:16px 12px;border-top:1px solid var(--admin-line-soft);vertical-align:middle;color:#33413b}
.admin-table tbody tr{transition:background-color 160ms ease}
.admin-table tbody tr:hover{background:#f6f8f5}
.admin-table td:first-child,.admin-table th:first-child{padding-left:4px}
.admin-table td:last-child,.admin-table th:last-child{text-align:right;padding-right:4px}
.admin-table strong{display:block;color:#17201d;letter-spacing:-.01em}
.admin-table small{display:block;margin-top:4px;color:#65736c;font-size:12px}
.admin-mobile-list{display:none}
.admin-badge{display:inline-flex;align-items:center;min-height:27px;padding:4px 10px;border:1px solid #cbd3ce;border-radius:999px;background:#edf1ee;color:#3d4b44;font-size:12px;font-weight:750;white-space:nowrap}
.admin-badge.received{background:#edf1ee;color:#3d4b44}
.admin-badge.in-production{background:#e8eff9;color:#2d537c;border-color:#c4d5eb}
.admin-badge.ready{background:#e5f2e9;color:#28623e;border-color:#b9ddc4}
.admin-badge.delivered{background:#e5f2e9;color:#28623e;border-color:#b9ddc4}
.admin-badge.cancelled,.admin-badge.rejected{background:#fae9ee;color:#922945;border-color:#eac3cb}
.admin-badge.pending{background:#fff5d9;color:#6d531f;border-color:#e6d399}
.admin-alert{padding:14px 16px;border:1px solid #b9ddc4;border-radius:10px;background:#e9f6ed;color:#235d35;margin:16px 0}
.admin-alert.error{border-color:#eac3cb;background:#fbecef;color:#861d36}
.admin-alert.warning{border-color:#e6d399;background:#fff6de;color:#6c511c}
.admin-empty{padding:42px 18px;text-align:center;border:1px dashed #cfc9bf;border-radius:10px}
.admin-empty h3{margin-bottom:6px}
.admin-empty p{margin:0 auto 18px;color:#5b5852}
.admin-loading{display:grid;gap:12px}
.admin-skeleton{height:58px;border-radius:9px;background:linear-gradient(90deg,#f0ede8 25%,#faf9f7 50%,#f0ede8 75%);background-size:200% 100%;animation:admin-shimmer 1.4s ease-in-out infinite}
@keyframes admin-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}
.admin-stat-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0}
.admin-stat{padding:15px;border:1px solid var(--admin-line);border-radius:10px;background:#f7f9f6}
.admin-stat dt{font-size:12px;color:#65736c}
.admin-stat dd{margin:3px 0 0;font-size:18px;font-weight:800}
.admin-detail-grid{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(280px,.8fr);gap:18px;align-items:start}
.admin-stack{display:grid;min-width:0;gap:18px}
.admin-definition-list{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin:0}
.admin-definition-list dt{font-size:12px;color:#65736c}
.admin-definition-list dd{margin:3px 0 0;font-weight:750}
.admin-section-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}
.admin-item{padding:15px 0;border-top:1px solid var(--admin-line-soft)}
.admin-item:first-child{padding-top:0;border-top:0}
.admin-item:last-child{padding-bottom:0}
.admin-item-row{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.admin-item-row small{color:#65736c}
.admin-item > strong{display:block;color:#17201d;line-height:1.35}
.admin-item > small,.admin-item-row > div > small{display:block;margin-top:4px;color:#65736c;line-height:1.4}
.admin-measurements{width:100%;border-collapse:collapse;font-size:13px}
.admin-measurements th,.admin-measurements td{padding:11px 8px;border-bottom:1px solid var(--admin-line-soft);text-align:left;vertical-align:top}
.admin-measurements th{font-size:10px;color:#65736c;text-transform:uppercase;letter-spacing:.07em}
.admin-measurements td strong{display:block;color:#17201d}
.admin-measurements td small{display:block;margin-top:4px;color:#65736c;line-height:1.35}
.admin-dialog-backdrop{position:fixed;inset:0;z-index:var(--z-modal);display:grid;place-items:center;padding:18px;background:#171717b8}
.admin-dialog{width:min(640px,100%);max-height:min(760px,calc(100vh - 36px));overflow:auto;background:#fff;border:1px solid #d5d1c9;border-radius:14px;padding:24px;box-shadow:0 8px 24px #17171726}
.admin-dialog h2{margin:0;font-size:22px;letter-spacing:-.02em}
.admin-dialog header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}
.admin-dialog-close{border:0;background:transparent;color:#514e48;font:inherit;font-size:24px;line-height:1;cursor:pointer;padding:2px 7px;border-radius:8px}
.admin-dialog-close:hover{background:#edf1ee}
.admin-dialog-close:focus-visible{outline:3px solid var(--admin-focus);outline-offset:2px}
.admin-dialog-footer{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:20px}
.admin-timeline{list-style:none;margin:0;padding:0 0 0 12px;border-left:1px solid #d5d1c9}
.admin-timeline li{position:relative;padding:0 0 22px 18px}
.admin-timeline li:last-child{padding-bottom:0}
.admin-timeline li::before{content:"";position:absolute;left:-18px;top:4px;width:9px;height:9px;border:2px solid #f5f2ec;border-radius:50%;background:#202020;box-shadow:0 0 0 1px #202020}
.admin-timeline strong{font-size:14px}
.admin-timeline p{margin:4px 0;color:#4d4943}
.admin-timeline small{color:#68645d}
.admin-note{padding:12px 14px;border-radius:9px;background:#eef2ef;color:#3d4b44;font-size:13px}
.admin-check{display:flex;align-items:flex-start;gap:9px;color:#4d4943;font-size:13px}
.admin-check input{margin-top:3px;accent-color:#202020}
.admin-link{color:#214d3f;font-weight:750;text-underline-offset:3px}
.admin-visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media(max-width:960px){.admin-root{grid-template-columns:1fr}.admin-sidebar{display:none}.admin-mobile-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 18px;background:#202020;color:#fff}.admin-mobile-bar a{color:#fff;text-decoration:none;font-weight:800;letter-spacing:-.03em}.admin-mobile-bar span{color:#bdbbb6;font-size:12px}.admin-content{padding:28px 24px 48px}.admin-detail-grid{grid-template-columns:1fr}}
@media(max-width:700px){.admin-content{padding:22px 16px 40px}.admin-page-header{display:block;margin-bottom:22px}.admin-page-header .admin-actions{justify-content:flex-start;margin-top:16px}.admin-hero{display:block;padding:20px}.admin-hero .admin-badge{margin-top:16px}.admin-card{padding:18px}.admin-card-header{align-items:flex-start;flex-direction:column;gap:9px}.admin-toolbar{display:grid;grid-template-columns:1fr;margin:16px 0}.admin-toolbar .admin-field:first-child{width:auto}.admin-toolbar .admin-button{width:100%}.admin-form-grid{grid-template-columns:1fr}.admin-form-grid .full{grid-column:auto}.admin-table-wrap{display:none}.admin-mobile-list{display:grid;gap:0}.admin-mobile-list .admin-item{padding:16px 0}.admin-definition-list{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.admin-stat-grid{grid-template-columns:1fr 1fr}.admin-dialog-backdrop{padding:10px}.admin-dialog{max-height:calc(100vh - 20px);padding:20px}.admin-actions{justify-content:flex-start}.admin-actions .admin-button{flex:1 1 auto}.admin-measurements{min-width:620px}.admin-measurements-wrap{overflow-x:auto;contain:paint}}
.admin-mobile-bar>span{display:inline-flex;align-items:center;gap:8px}
@media(prefers-reduced-motion:reduce){.admin-skeleton{animation:none}.admin-button,.admin-nav a{transition:none}}
`;

export default async function AdminLayout({children}: Readonly<{children: ReactNode}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect('/login');
  if (session.user.role !== 'admin' && session.user.role !== 'operator') {
    redirect('/my-panel');
  }
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: ADMIN_STYLES}} />
      <link rel="icon" href="data:," />
      <div className="admin-root">
        <aside className="admin-sidebar" aria-label="Administration sidebar">
          <div className="admin-sidebar-top">
            <Link className="admin-brand" href="/admin-orders">
              LUX <span>ADMIN</span>
            </Link>
            <div className="admin-sidebar-caption"><span className="admin-status-dot" aria-hidden="true" /> Operations console</div>
          </div>
          <AdminNav />
          <div className="admin-sidebar-note">
            <strong>Staff workspace</strong>
            Server permissions and validation remain authoritative.
          </div>
        </aside>
        <div className="admin-workspace">
          <header className="admin-mobile-bar">
            <Link href="/admin-orders">LUX <span>ADMIN</span></Link>
            <span><i className="admin-status-dot" aria-hidden="true" /> Staff workspace</span>
          </header>
          <main className="admin-content">{children}</main>
        </div>
      </div>
    </>
  );
}
