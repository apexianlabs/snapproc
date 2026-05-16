import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { result, process_name, department } = await request.json()
    
    // Build HTML content that converts well to DOCX-like format
    // Using a simple RTF approach for maximum compatibility
    const steps = result.steps || []
    
    let rtf = '{\\rtf1\\ansi\\deff0'
    rtf += '{\\fonttbl{\\f0 Arial;}}'
    rtf += '{\\colortbl;\\red30\\green64\\blue175;\\red55\\green65\\blue81;\\red100\\green116\\blue139;}'
    
    // Title
    rtf += '\\f0\\fs36\\b\\cf1 ' + escapeRtf(result.sop_title || process_name) + '\\b0\\fs22\\par'
    rtf += '\\cf3\\fs18 ' + escapeRtf(department) + ' | ' + new Date().toLocaleDateString() + '\\cf0\\fs22\\par\\par'
    
    // Purpose
    if (result.purpose) {
      rtf += '\\b\\cf1\\fs24 PURPOSE\\b0\\cf0\\fs22\\par'
      rtf += escapeRtf(result.purpose) + '\\par\\par'
    }
    
    // Scope
    if (result.scope) {
      rtf += '\\b\\cf1\\fs24 SCOPE\\b0\\cf0\\fs22\\par'
      rtf += escapeRtf(result.scope) + '\\par\\par'
    }
    
    // Steps
    if (steps.length > 0) {
      rtf += '\\b\\cf1\\fs24 PROCEDURE\\b0\\cf0\\fs22\\par\\par'
      steps.forEach((step, i) => {
        const num = step.number || i + 1
        const action = step.action || step.title || ''
        rtf += '\\b Step ' + num + ': ' + escapeRtf(action) + '\\b0\\par'
        if (step.tool && step.tool !== 'To be specified based on actual workflow tooling') {
          rtf += '\\cf3 Tool: ' + escapeRtf(step.tool) + '\\cf0\\par'
        }
        if (step.note) {
          rtf += '\\cf3 Note: ' + escapeRtf(step.note) + '\\cf0\\par'
        }
        if (step.conditional && step.conditional !== 'null' && step.conditional !== null) {
          rtf += '\\cf3 If: ' + escapeRtf(step.conditional) + '\\cf0\\par'
        }
        rtf += '\\par'
      })
    }
    
    // Expected outcome
    if (result.expected_outcome) {
      rtf += '\\b\\cf1\\fs24 EXPECTED OUTCOME\\b0\\cf0\\fs22\\par'
      rtf += escapeRtf(result.expected_outcome) + '\\par\\par'
    }
    
    // Footer
    rtf += '\\cf3\\fs18 Generated with Snapproc | snapproc.com\\cf0\\par'
    rtf += '}'
    
    const buffer = Buffer.from(rtf, 'utf8')
    const docx = buffer.toString('base64')
    
    return NextResponse.json({ docx })
  } catch(err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function escapeRtf(str) {
  if (!str) return ''
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\n/g, '\\par ')
}
