'use client';

import React from 'react';
import Link from 'next/link';
import { Bell, ShoppingCart, MessageSquare, CreditCard, ChevronDown } from 'lucide-react';

export function AdsyLogoSVG() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="32" viewBox="0 0 90 32" fill="none">
      <path d="M45.3363 17.441L43.0074 11.1788L40.7303 17.441H45.3363ZM51.5986 24.1172H47.8723L46.4232 20.2875H39.6952L38.2978 24.1172H34.675L41.2478 7.24548H44.8706L51.5986 24.1172Z" fill="#112C3E"/>
      <path d="M55.0144 17.7514C55.0144 19.0452 55.1697 19.9768 55.5319 20.5979C56.0495 21.4259 56.774 21.84 57.7056 21.84C58.4302 21.84 59.1029 21.5294 59.6205 20.9084C60.138 20.2873 60.3968 19.304 60.3968 18.0619C60.3968 16.6646 60.138 15.6295 59.6205 15.0084C59.1029 14.3874 58.4819 14.0769 57.6538 14.0769C56.8775 14.0769 56.2565 14.3874 55.7389 15.0084C55.2732 15.6295 55.0144 16.5611 55.0144 17.7514ZM63.6573 24.1171H60.6556V22.3057C60.138 22.9785 59.5687 23.5478 58.8959 23.8584C58.2231 24.2206 57.5503 24.3759 56.8258 24.3759C55.4284 24.3759 54.2381 23.8066 53.203 22.668C52.1679 21.5294 51.7021 19.9768 51.7021 17.9067C51.7021 15.8365 52.1679 14.2839 53.1513 13.1971C54.1346 12.1102 55.3767 11.5927 56.8258 11.5927C58.1714 11.5927 59.3617 12.162 60.345 13.3006V7.24536H63.5538V24.1171H63.6573Z" fill="#112C3E"/>
      <path d="M65.21 20.6496L68.4705 20.132C68.6257 20.7531 68.8845 21.2189 69.2985 21.5812C69.7125 21.8917 70.3336 22.0469 71.0581 22.0469C71.8862 22.0469 72.5073 21.8917 72.9213 21.5812C73.1801 21.3741 73.3353 21.0636 73.3353 20.7013C73.3353 20.4426 73.2836 20.2355 73.1283 20.0803C72.973 19.925 72.6108 19.7698 72.0415 19.6663C69.4538 19.097 67.7977 18.5794 67.0731 18.1136C66.0898 17.4408 65.624 16.561 65.624 15.3707C65.624 14.3356 66.038 13.404 66.8661 12.6795C67.6941 11.9549 68.988 11.5927 70.7476 11.5927C72.4037 11.5927 73.6458 11.8514 74.4739 12.4207C75.302 12.99 75.8713 13.7663 76.13 14.8531L73.0765 15.4224C72.9213 14.9567 72.7143 14.5944 72.352 14.3356C71.9897 14.0768 71.4722 13.9733 70.7994 13.9733C69.9713 13.9733 69.3503 14.0768 68.988 14.3356C68.7292 14.4909 68.6257 14.6979 68.6257 15.0084C68.6257 15.2154 68.7292 15.4224 68.9362 15.5777C69.2468 15.7847 70.2301 16.0952 71.938 16.5093C73.6458 16.9233 74.8879 17.3891 75.5607 17.9584C76.2335 18.5277 76.5958 19.3557 76.5958 20.3391C76.5958 21.4776 76.13 22.4092 75.1985 23.2373C74.2669 24.0653 72.8695 24.4276 71.0581 24.4276C69.402 24.4276 68.0564 24.0653 67.1249 23.3925C66.1415 22.7197 65.5205 21.7882 65.21 20.6496Z" fill="#112C3E"/>
      <path d="M77.4756 11.9034H80.8913L83.7896 20.5981L86.636 11.9034H90L85.7045 23.6516L84.9281 25.7735C84.6694 26.498 84.3589 27.0156 84.1001 27.4296C83.8413 27.7919 83.5308 28.1024 83.2203 28.3612C82.9097 28.6199 82.4957 28.7752 81.9782 28.9305C81.5124 29.0857 80.9431 29.1375 80.322 29.1375C79.701 29.1375 79.08 29.0857 78.5107 28.9305L78.2001 26.3945C78.7177 26.498 79.1835 26.5498 79.5457 26.5498C80.322 26.5498 80.8396 26.3428 81.2019 25.877C81.5641 25.4112 81.8229 24.8937 82.0299 24.1691L77.4756 11.9034Z" fill="#112C3E"/>
      <path d="M15.7332 31.4664C24.4224 31.4664 31.4664 24.4224 31.4664 15.7332C31.4664 7.04398 24.4224 0 15.7332 0C7.04398 0 0 7.04398 0 15.7332C0 24.4224 7.04398 31.4664 15.7332 31.4664Z" fill="#3E4FEA"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M24.4797 14.4912C24.4797 14.4912 24.4279 14.5429 24.3762 14.5947C24.4797 10.5579 23.7034 6.77982 23.4446 6.67631C23.0306 6.52105 21.2709 8.43595 21.2709 8.43595C19.2008 7.65964 17.3894 7.45262 15.9403 7.45262C14.4912 7.45262 12.6798 7.65964 10.6096 8.43595C10.6096 8.43595 8.84999 6.52105 8.43596 6.67631C8.17719 6.77982 7.40089 10.5579 7.50439 14.5947C4.34741 21.5814 9.57455 23.9104 9.57455 23.9104C9.78156 23.5481 9.93683 23.1858 10.0403 22.8235C10.2473 23.0823 10.5061 23.2893 10.7649 23.4963C10.7649 23.5481 10.7649 23.5998 10.8166 23.6516C12.2658 24.7384 14.0254 25.1525 15.8885 25.1007C17.4411 25.1007 18.9938 24.8419 20.3394 24.0656C20.3911 24.0139 20.4429 24.0139 20.4946 23.9621C20.5464 23.9104 20.5981 23.9104 20.6499 23.8586C21.0122 23.5998 21.3744 23.3411 21.7367 22.9788C21.8402 23.2893 21.9437 23.5998 22.099 23.9104C22.099 23.9104 27.7402 21.5814 24.4797 14.4912Z" fill="white"/>
    </svg>
  );
}

export default function AdsyHeader() {
  return (
    <>
      {/* Top Banner Alert */}
      <div className="cp-top-promo">
        <span>🎁</span>
        <span>
          <strong>Limited time offer!</strong> Get <strong>3% extra bonus</strong> for topping up via Bank Wire Transfer or Crypto.
        </span>
        <button 
          style={{ 
            border: 'none', 
            background: '#EAB308', 
            color: '#1E293B', 
            padding: '2px 8px', 
            borderRadius: '4px', 
            fontSize: '11px', 
            fontWeight: 800, 
            cursor: 'pointer' 
          }}
        >
          Add funds now →
        </button>
      </div>

      {/* Main Header */}
      <header className="cp-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <AdsyLogoSVG />
          </Link>
          <span 
            style={{ 
              background: '#EAF1F6', 
              color: '#3E4FEA', 
              fontSize: '11px', 
              fontWeight: 800, 
              padding: '4px 10px', 
              borderRadius: '20px', 
              textTransform: 'uppercase', 
              letterSpacing: '0.5px' 
            }}
          >
            Buyer Control Panel
          </span>
          <span 
            style={{ 
              background: '#DCFCE7', 
              color: '#166534', 
              fontSize: '11px', 
              fontWeight: 800, 
              padding: '4px 8px', 
              borderRadius: '20px' 
            }}
          >
            AI Visibility Engine
          </span>
        </div>

        {/* Right User Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Live Balance Pill */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: '#F8FAFC', 
              padding: '6px 14px', 
              borderRadius: '30px', 
              border: '1px solid #E2E8F0',
              fontSize: '12px'
            }}
          >
            <span>
              <span style={{ color: '#64748B' }}>Balance: </span>
              <strong style={{ color: '#0E810C' }}>$120.00</strong>
            </span>
            <div style={{ width: '1px', height: '12px', background: '#CBD5E1' }} />
            <span>
              <span style={{ color: '#64748B' }}>Reserved: </span>
              <strong>$0.00</strong>
            </span>
            <div style={{ width: '1px', height: '12px', background: '#CBD5E1' }} />
            <span>
              <span style={{ color: '#64748B' }}>Bonus: </span>
              <strong style={{ color: '#3E4FEA' }}>$15.00</strong>
            </span>
          </div>

          <button className="btn-adsy-green">
            <CreditCard size={14} /> Add Funds
          </button>

          {/* Quick Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button className="btn-adsy-outline" style={{ padding: '7px 9px' }} title="Messages">
              <MessageSquare size={16} color="#64748B" />
            </button>
            <button className="btn-adsy-outline" style={{ padding: '7px 9px', position: 'relative' }} title="Notifications">
              <Bell size={16} color="#64748B" />
              <span 
                style={{ 
                  position: 'absolute', 
                  top: '-4px', 
                  right: '-4px', 
                  background: '#ED254E', 
                  color: '#FFFFFF', 
                  fontSize: '9px', 
                  fontWeight: 800, 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}
              >
                1
              </span>
            </button>
            <button className="btn-adsy-outline" style={{ padding: '7px 9px' }} title="Cart">
              <ShoppingCart size={16} color="#64748B" />
            </button>
          </div>

          {/* User profile dropdown pill */}
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '5px 10px', 
              border: '1px solid #E2E8F0', 
              borderRadius: '20px', 
              background: '#FFFFFF', 
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <div 
              style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%', 
                background: '#3E4FEA', 
                color: '#FFF', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '11px',
                fontWeight: 800
              }}
            >
              Y
            </div>
            <span>shaforostov.e@...</span>
            <ChevronDown size={14} color="#64748B" />
          </div>
        </div>
      </header>
    </>
  );
}
