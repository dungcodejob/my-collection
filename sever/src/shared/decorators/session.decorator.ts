import { SessionInfo } from '@app/auth';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import geoip from 'geoip-lite';

type SessionRecord = keyof SessionInfo;

export const Session = createParamDecorator(
  (key: SessionRecord, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionInfo = getSessionInfoFromReq(request);
    return key ? sessionInfo?.[key] : sessionInfo;
  },
);

function getSessionInfoFromReq(req: Request): SessionInfo {
  const ipAddress: string =
    req.ip ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection as any)?.socket?.remoteAddress;
  const userAgent = req.headers['user-agent'] || 'unknown';
  const deviceType = getDeviceType(userAgent);
  const location = getLocation(ipAddress);

  return {
    ipAddress,
    userAgent,
    deviceType,
    location,
  };
}

function getDeviceType(userAgent?: string): string {
  if (!userAgent) return 'unknown';

  const ua = userAgent.toLowerCase();

  // Mobile devices
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    if (/iphone|ipod/i.test(ua)) return 'iPhone';
    if (/android/i.test(ua)) return 'Android';
    if (/blackberry/i.test(ua)) return 'BlackBerry';
    if (/windows phone/i.test(ua)) return 'Windows Phone';
    return 'Mobile';
  }

  // Tablets
  if (/tablet|ipad/i.test(ua)) {
    if (/ipad/i.test(ua)) return 'iPad';
    return 'Tablet';
  }

  // Desktop browsers
  if (/chrome/i.test(ua)) return 'Desktop Chrome';
  if (/firefox/i.test(ua)) return 'Desktop Firefox';
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return 'Desktop Safari';
  if (/edge/i.test(ua)) return 'Desktop Edge';
  if (/opera/i.test(ua)) return 'Desktop Opera';

  return 'Desktop';
}

function getLocation(ipAddress?: string) {
  if (!ipAddress) return 'unknown';
  const geo = geoip.lookup(ipAddress);
  if (geo) {
    return `${geo.country}, ${geo.region}, ${geo.city}`;
  }
  return 'unknown';
}
