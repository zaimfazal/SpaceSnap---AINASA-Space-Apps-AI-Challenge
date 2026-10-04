import { 
  Globe2, 
  Cpu, 
  Satellite, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-10">
      {/* Overview Hero */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-xs font-mono text-cyan-300">
          <Globe2 className="w-3.5 h-3.5" />
          <span>Scientific Methodology & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-cyan-100 to-sky-400 bg-clip-text text-transparent">
          About TerraVision AI
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          TerraVision AI transforms complex orbital Earth and space observation imagery into accessible, 
          spatially localized features and plain-language scientific explanations.
        </p>
      </div>

      {/* 5-Step Pipeline Architecture */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>The End-to-End Analysis Pipeline</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 1</span>
            <h3 className="text-sm font-semibold text-white">Safe Ingestion & Validation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Images are validated for MIME formats, file size limits (20MB), and dimensional sanity. 
              Remote image URLs undergo strict SSRF screening, prohibiting private subnets, loopbacks, 
              and metadata endpoints.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 2</span>
            <h3 className="text-sm font-semibold text-white">Multi-Spectral Proxy Indexing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The engine transforms optical RGB bands into specialized proxies including Green Leaf Index (GLI) 
              for vegetative canopy, Blue-to-Red band ratios for pelagic marine absorption, and HSV albedo 
              for cloud and ice reflectance.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 3</span>
            <h3 className="text-sm font-semibold text-white">Spatial Feature Localization</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              OpenCV morphological filters and contour extraction isolate connected regions, compute 
              normalized bounding boxes [0..1] and polygonal boundaries, and assign grounded confidence 
              ratings based on contour solidity and spectral uniformity.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <span className="text-xs font-mono text-cyan-400 font-bold">STAGE 4</span>
            <h3 className="text-sm font-semibold text-white">Grounded Plain-Language Synthesis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              An educational synthesis engine converts localized spatial data into a six-part structured 
              explanation: overview, identified features, visible relationships, real-world significance, 
              analytical certainty, and explicit limitations.
            </p>
          </div>
        </div>
      </div>

      {/* Authoritative Data Sources */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Satellite className="w-5 h-5 text-sky-400" />
          <span>Data Sources & Planetary Sensors</span>
        </h2>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            TerraVision AI integrates imagery exclusively from legitimate public Earth observation repositories:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href="https://earthobservatory.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-slate-200">NASA Earth Observatory</p>
                <p className="text-[11px] text-slate-500">Verified thematic satellite events</p>
              </div>
              <ExternalLink className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            </a>

            <a
              href="https://images.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-slate-200">NASA Image & Video Library</p>
                <p className="text-[11px] text-slate-500">Public search API integration</p>
              </div>
              <ExternalLink className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            </a>

            <a
              href="https://worldview.earthdata.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-slate-200">NASA Worldview (EOSDIS)</p>
                <p className="text-[11px] text-slate-500">Daily global MODIS & VIIRS imagery</p>
              </div>
              <ExternalLink className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            </a>

            <a
              href="https://landsat.gsfc.nasa.gov/"
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-slate-200">USGS / NASA Landsat Program</p>
                <p className="text-[11px] text-slate-500">30-meter multispectral surface reflectance</p>
              </div>
              <ExternalLink className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Scientific Restraint and Limitations */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          <span>Scientific Ethics & Restraint</span>
        </h2>

        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-900/40 space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            TerraVision AI enforces strict scientific restraint. The system adheres to the following principles:
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-400">
            <li>
              <strong className="text-slate-200">Visual Evidence vs Scientific Proof:</strong> Optical features 
              delineate surface light reflectance. They do not constitute in-situ ground measurements.
            </li>
            <li>
              <strong className="text-slate-200">Honest Confidence Scoring:</strong> Confidence is computed from 
              contour coherence and radiometric contrast, rather than fabricating 99.9% certainty.
            </li>
            <li>
              <strong className="text-slate-200">Explicit Labeling of Demo Data:</strong> Precomputed benchmark 
              annotations for sample imagery are permanently stamped as "Demo Analysis" and never presented 
              as real-time black-box inferences.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
