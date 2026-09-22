export default function handler(req: any, res: any) {
  return res.status(200).json({
    status: 'ok',
    platform: 'CampusCore',
    release: 'Phase 1 Launch',
    timestamp: new Date().toISOString(),
  });
}
