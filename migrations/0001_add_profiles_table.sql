CREATE TABLE "profiles" (
	"id" varchar PRIMARY KEY NOT NULL,
	"nickname" varchar(32),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
