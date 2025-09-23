import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { createSupabaseAdmin } from "../lib/supabase";
import { AppError } from "../utils/errors";

const router = Router();
const supabase = createSupabaseAdmin();

const upsertProfileSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  profileImageUrl: z.string().url().optional(),
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user!.id)
      .maybeSingle();

    if (error) throw new AppError(500, "Failed to load profile", error);
    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
});

router.put("/me", requireAuth, async (req, res, next) => {
  try {
    const payload = upsertProfileSchema.parse(req.body);

    const { data, error } = await supabase
      .from("users")
      .upsert(
        { id: req.user!.id, ...payload },
        { onConflict: "id" },
      )
      .select()
      .maybeSingle();

    if (error) throw new AppError(500, "Failed to update profile", error);

    res.json({ profile: data });
  } catch (err) {
    next(err);
  }
});

export { router as profileRouter };
