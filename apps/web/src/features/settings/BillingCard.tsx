import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import type { BillingOverview, PlanTier } from '../../types';
import { fetchBillingOverview, openBillingPortal, startCheckout } from '../../services/api/billing';
import { ApiError } from '../../services/api/client';
import { LoadingButton } from '../../components/Loader';
import { usePermissions } from '../../hooks/storeHooks';

interface BillingCardProps {
  onPlanChanged?: (planName: string) => void;
}

function usagePercent(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.round((current / max) * 100));
}

function statusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
  if (status === 'active') return 'success';
  if (status === 'trial') return 'warning';
  if (status === 'past_due') return 'error';
  return 'default';
}

function trialDaysLeft(trialEndsAt: string | null): number | null {
  if (!trialEndsAt) return null;
  const diff = new Date(trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function BillingCard({ onPlanChanged }: BillingCardProps) {
  const { can, role } = usePermissions();
  const canManage = can('settings:write') || role === 'platform_admin';
  const [data, setData] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionTier, setActionTier] = useState<PlanTier | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await fetchBillingOverview();
      setData(overview);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load billing');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpgrade = async (tier: PlanTier) => {
    setActionTier(tier);
    setError(null);
    try {
      const result = await startCheckout(tier);
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      if (result.redirectUrl) {
        onPlanChanged?.(tier.charAt(0).toUpperCase() + tier.slice(1));
        await load();
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Checkout failed');
    } finally {
      setActionTier(null);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const { url } = await openBillingPortal();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Subscription & Billing
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error ?? 'Billing unavailable'}</Alert>
        </CardContent>
      </Card>
    );
  }

  const { subscription, plans, mode, provider, billingRegion } = data;
  const daysLeft = trialDaysLeft(subscription.trialEndsAt);
  const assetPct = usagePercent(subscription.usage.assets, subscription.plan.maxAssets);
  const adminPct = usagePercent(subscription.usage.admins, subscription.plan.maxAdmins);

  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6">
            <CreditCardIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
            Subscription & Billing
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={subscription.plan.name} color="primary" size="small" />
            <Chip label={subscription.status} color={statusColor(subscription.status)} size="small" variant="outlined" />
            <Chip label={billingRegion === 'IN' ? 'India' : 'Global'} size="small" variant="outlined" />
            <Chip
              label={mode === 'demo' ? 'Demo' : provider === 'razorpay' ? 'Razorpay' : 'Stripe'}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {subscription.status === 'trial' && daysLeft !== null && (
          <Alert severity={daysLeft <= 3 ? 'warning' : 'info'} sx={{ mb: 2 }}>
            {daysLeft === 0
              ? 'Trial ends today — upgrade to keep full access.'
              : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your trial.`}
          </Alert>
        )}

        {mode === 'demo' && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Demo mode: upgrades apply instantly. Add Razorpay keys (India) and/or Stripe keys (global) for live billing.
          </Alert>
        )}

        {mode === 'dual' && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Dual billing active — this tenant uses {provider === 'razorpay' ? 'Razorpay (INR, UPI/cards)' : 'Stripe (USD, global cards)'}.
          </Alert>
        )}

        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Usage
        </Typography>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Assets — {subscription.usage.assets} / {subscription.plan.maxAssets}
          </Typography>
          <LinearProgress variant="determinate" value={assetPct} color={assetPct >= 90 ? 'warning' : 'primary'} sx={{ mt: 0.5, mb: 1.5 }} />
          <Typography variant="caption" color="text.secondary">
            Admin seats — {subscription.usage.admins} / {subscription.plan.maxAdmins}
          </Typography>
          <LinearProgress variant="determinate" value={adminPct} color={adminPct >= 90 ? 'warning' : 'primary'} sx={{ mt: 0.5 }} />
        </Box>

        {canManage && (
          <>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Plans
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 2 }}>
              {plans.map((plan) => {
                const isCurrent = plan.tier === subscription.plan.tier;
                const isEnterprise = plan.tier === 'enterprise';
                return (
                  <Box
                    key={plan.tier}
                    sx={{
                      p: 1.5,
                      border: '1px solid',
                      borderColor: isCurrent ? 'primary.main' : 'divider',
                      borderRadius: 1,
                      bgcolor: isCurrent ? 'action.selected' : 'transparent',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {plan.name}
                          {isCurrent && (
                            <Chip label="Current" size="small" sx={{ ml: 1 }} />
                          )}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isEnterprise
                            ? 'Custom pricing — contact sales'
                            : `${plan.priceLabel ?? `$${plan.pricePerUnit}/asset/month`} · up to ${plan.maxAssets} assets`}
                        </Typography>
                      </Box>
                      {!isCurrent && !isEnterprise && (
                        <LoadingButton
                          size="small"
                          variant="contained"
                          loading={actionTier === plan.tier}
                          startIcon={<RocketLaunchIcon />}
                          onClick={() => void handleUpgrade(plan.tier)}
                        >
                          {mode === 'demo' ? 'Switch' : 'Upgrade'}
                        </LoadingButton>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>

            {provider === 'stripe' && subscription.hasStripeSubscription && mode !== 'demo' && (
              <Button variant="outlined" onClick={() => void handlePortal()} disabled={portalLoading}>
                Manage payment method & invoices
              </Button>
            )}

            {provider === 'razorpay' && subscription.hasRazorpaySubscription && mode !== 'demo' && (
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Manage your UPI/card mandate via the payment link sent by Razorpay, or contact support to change plans.
              </Typography>
            )}
          </>
        )}

        {!canManage && (
          <Typography variant="body2" color="text.secondary">
            Contact your tenant admin to change the subscription plan.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
