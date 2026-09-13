'use client';
import { useEffect,useRef,type ReactNode } from 'react';
export function Dialog({open,onClose,title,children}:{open:boolean;onClose:()=>void;title:string;children:ReactNode}){const ref=useRef<HTMLDialogElement>(null);useEffect(()=>{const node=ref.current;if(open&&!node?.open)node?.showModal();else if(!open&&node?.open)node.close();},[open]);return <dialog ref={ref} className="dialog" aria-label={title} onCancel={onClose} onClose={onClose}><h2>{title}</h2>{children}<button type="button" className="button secondary" onClick={onClose}>Close</button></dialog>}
