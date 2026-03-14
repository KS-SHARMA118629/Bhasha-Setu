-- Government Schemes Table
CREATE TABLE "public"."government_schemes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "description" text NOT NULL,
    "eligibility" text,
    "required_documents" text,
    "category" text,
    "language_code" text REFERENCES "public"."languages"("code"),
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE "public"."government_schemes" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public schemes are viewable by everyone." ON "public"."government_schemes" FOR SELECT USING (true);


-- Alter Tickets table to include translated description and audio URL
ALTER TABLE "public"."tickets" ADD COLUMN "translated_description" text;
ALTER TABLE "public"."tickets" ADD COLUMN "audio_url" text;

-- Forms Template Table
CREATE TABLE "public"."form_templates" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" text NOT NULL,
    "instructions" text,
    "fields" jsonb, -- Array of objects: { name, type, label, tooltip, autoFillKey }
    "created_at" timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE "public"."form_templates" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public forms are viewable by everyone." ON "public"."form_templates" FOR SELECT USING (true);
