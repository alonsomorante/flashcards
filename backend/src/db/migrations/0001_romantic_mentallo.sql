CREATE INDEX "idx_chapters_book_id" ON "chapters" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "idx_flashcards_chapter_id" ON "flashcards" USING btree ("chapter_id");