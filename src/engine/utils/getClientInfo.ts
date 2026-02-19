import { logger } from '../../utils/logger';

export function getClientInfo(): { userAgent: string; platform: string; os: string } {
  try {
    if (typeof navigator === 'undefined') return { userAgent: '', platform: '', os: 'unknown' };

    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const uaLower = (ua + ' ' + platform).toLowerCase();

    const detectOS = (s: string) => {
      if (/iphone|ipad|ipod|ios/.test(s)) return 'ios';
      if (/android/.test(s)) return 'android';
      if (/windows nt|win32|win64|wow64|win/.test(s)) return 'windows';
      if (/macintosh|mac os x/.test(s)) return 'macos';
      if (/linux/.test(s)) return 'linux';
      return 'unknown';
    };

    return { userAgent: ua, platform, os: detectOS(uaLower) };
  } catch (err) {
    logger.debug('[getClientInfo] failed to read navigator', err);
    return { userAgent: '', platform: '', os: 'unknown' };
  }
}
