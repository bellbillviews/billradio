import { useEffect, useRef } from "react";

interface AdNetwork {
  id: string;
  name: string;
  network_type: string;
  publisher_id: string | null;
  slot_ids: Record<string, string>;
  config: Record<string, unknown>;
  placement: string;
}

interface AdNetworkScriptProps {
  network: AdNetwork;
  placement: string;
  className?: string;
}

export function AdNetworkScript({ network, placement, className = "" }: AdNetworkScriptProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const slotId = network.slot_ids?.[placement] || network.slot_ids?.default || "";

    // Clear previous content
    containerRef.current.innerHTML = "";

    switch (network.network_type) {
      case "adsense": {
        // Google AdSense
        const script = document.createElement("script");
        script.async = true;
        script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
        script.setAttribute("data-ad-client", network.publisher_id || "");
        containerRef.current.appendChild(script);

        const ins = document.createElement("ins");
        ins.className = "adsbygoogle";
        ins.style.display = "block";
        ins.setAttribute("data-ad-client", network.publisher_id || "");
        ins.setAttribute("data-ad-slot", slotId);
        ins.setAttribute("data-ad-format", "auto");
        ins.setAttribute("data-full-width-responsive", "true");
        containerRef.current.appendChild(ins);

        // Push ad
        try {
          ((window as unknown) as { adsbygoogle: unknown[] }).adsbygoogle = 
            ((window as unknown) as { adsbygoogle: unknown[] }).adsbygoogle || [];
          ((window as unknown) as { adsbygoogle: unknown[] }).adsbygoogle.push({});
        } catch {}
        break;
      }

      case "adsterra": {
        // Adsterra
        const script = document.createElement("script");
        script.src = `//www.highperformanceformat.com/${network.publisher_id}/invoke.js`;
        script.async = true;
        containerRef.current.appendChild(script);

        const atOptions = document.createElement("script");
        atOptions.innerHTML = `
          atOptions = {
            'key': '${slotId}',
            'format': 'iframe',
            'height': 250,
            'width': 300,
            'params': {}
          };
        `;
        containerRef.current.insertBefore(atOptions, script);
        break;
      }

      case "propellerads": {
        // PropellerAds
        const script = document.createElement("script");
        script.src = `//pl${network.publisher_id}.profitablegatecpm.com/${slotId}.js`;
        script.async = true;
        containerRef.current.appendChild(script);
        break;
      }

      case "custom": {
        // Custom embed code from config
        const embedCode = network.config?.embed_code as string;
        if (embedCode) {
          containerRef.current.innerHTML = embedCode;
          // Execute any scripts in the embed code
          const scripts = containerRef.current.querySelectorAll("script");
          scripts.forEach(oldScript => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode?.replaceChild(newScript, oldScript);
          });
        }
        break;
      }

      default:
        break;
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [network, placement]);

  return (
    <div 
      ref={containerRef} 
      className={`ad-container min-h-[100px] flex items-center justify-center ${className}`}
      data-ad-network={network.network_type}
      data-ad-placement={placement}
    />
  );
}
