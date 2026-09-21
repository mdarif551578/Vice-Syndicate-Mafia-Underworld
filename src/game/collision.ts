/**
 * Ashen Road - Collision & Geometry Routines
 */
import { Collider } from '../types';

export function checkCircleCircle(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distSq = dx * dx + dy * dy;
  const radSum = r1 + r2;
  return distSq < radSum * radSum;
}

export function checkCircleRect(
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
): boolean {
  // Find closest point on rectangle to circle center
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));

  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < radius * radius;
}

export function isCollidingWithAny(
  x: number,
  y: number,
  radius: number,
  colliders: Collider[]
): boolean {
  for (let i = 0; i < colliders.length; i++) {
    const col = colliders[i];
    if (col.type === 'circle') {
      if (checkCircleCircle(x, y, radius, col.x, col.y, col.radius || 15)) {
        return true;
      }
    } else if (col.type === 'rect') {
      if (checkCircleRect(x, y, radius, col.x, col.y, col.w || 30, col.h || 30)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * De-penetrate position from overlapping colliders
 * Ensures entities never get permanently trapped inside any obstacles
 */
export function depenetratePosition(
  x: number,
  y: number,
  radius: number,
  colliders: Collider[]
): { x: number; y: number } {
  let resolvedX = x;
  let resolvedY = y;

  for (let i = 0; i < colliders.length; i++) {
    const col = colliders[i];
    if (col.type === 'circle') {
      const colR = col.radius || 15;
      const dx = resolvedX - col.x;
      const dy = resolvedY - col.y;
      const dist = Math.hypot(dx, dy);
      const minDist = radius + colR;

      if (dist < minDist) {
        if (dist === 0) {
          resolvedY += minDist + 1;
        } else {
          const push = minDist - dist + 1;
          resolvedX += (dx / dist) * push;
          resolvedY += (dy / dist) * push;
        }
      }
    } else if (col.type === 'rect') {
      const rx = col.x;
      const ry = col.y;
      const rw = col.w || 30;
      const rh = col.h || 30;

      const closestX = Math.max(rx, Math.min(resolvedX, rx + rw));
      const closestY = Math.max(ry, Math.min(resolvedY, ry + rh));

      const dx = resolvedX - closestX;
      const dy = resolvedY - closestY;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        if (dist === 0) {
          // Point is inside rectangle, find closest edge to push out
          const leftDist = resolvedX - rx;
          const rightDist = rx + rw - resolvedX;
          const topDist = resolvedY - ry;
          const bottomDist = ry + rh - resolvedY;
          const minEdge = Math.min(leftDist, rightDist, topDist, bottomDist);

          if (minEdge === leftDist) resolvedX = rx - radius - 1;
          else if (minEdge === rightDist) resolvedX = rx + rw + radius + 1;
          else if (minEdge === topDist) resolvedY = ry - radius - 1;
          else resolvedY = ry + rh + radius + 1;
        } else {
          const push = radius - dist + 1;
          resolvedX += (dx / dist) * push;
          resolvedY += (dy / dist) * push;
        }
      }
    }
  }

  return { x: resolvedX, y: resolvedY };
}

/**
 * Slide resolution: attempts X movement, then Y movement separately
 * Supports infinite world coordinate space without clamping to boundary edges
 * Includes automatic de-penetration unstuck logic
 */
export function resolveMovement(
  currX: number,
  currY: number,
  dx: number,
  dy: number,
  radius: number,
  _worldW: number,
  _worldH: number,
  colliders: Collider[]
): { x: number; y: number } {
  // 1. Initial de-penetration unstuck pass if entity starts inside an obstacle
  const depen = depenetratePosition(currX, currY, radius, colliders);
  let newX = depen.x;
  let newY = depen.y;

  // 2. Try X movement
  const targetX = newX + dx;
  if (!isCollidingWithAny(targetX, newY, radius, colliders)) {
    newX = targetX;
  }

  // 3. Try Y movement
  const targetY = newY + dy;
  if (!isCollidingWithAny(newX, targetY, radius, colliders)) {
    newY = targetY;
  }

  return { x: newX, y: newY };
}
