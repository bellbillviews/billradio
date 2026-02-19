-- Create listener_requests table for song requests
CREATE TABLE public.listener_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.listener_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a request (public form)
CREATE POLICY "Anyone can create listener requests"
ON public.listener_requests
FOR INSERT
WITH CHECK (true);

-- Only admins can view/manage requests
CREATE POLICY "Admins can view all listener requests"
ON public.listener_requests
FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update listener requests"
ON public.listener_requests
FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete listener requests"
ON public.listener_requests
FOR DELETE
USING (public.is_admin(auth.uid()));