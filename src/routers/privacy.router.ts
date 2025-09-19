import { Router } from "express";
import { z } from "zod";
import { requireAuth, clearSessionCookies } from "../middleware/auth";
import { createSupabaseAdmin } from "../lib/supabase";
import { AppError } from "../utils/errors";

const router = Router();
const supabase = createSupabaseAdmin();

const deleteAccountSchema = z.object({
  confirm: z.literal(true),
});

router.delete("/account", requireAuth, async (req, res, next) => {
  try {
    deleteAccountSchema.parse(req.body ?? { confirm: false });

    const { error } = await supabase.auth.admin.deleteUser(req.user!.id);

    if (error) throw new AppError(500, "Failed to delete account", error);

    clearSessionCookies(res);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export { router as privacyRouter };
