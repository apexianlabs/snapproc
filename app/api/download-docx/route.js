import { NextResponse } from 'next/server'
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx'

export async function POST(request) {
  try {
    const { result, process_name, department } = await request.json()
    const steps = result.steps || []
    const children = []

    // Title
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: result.sop_title || process_name, font: 'Arial', size: 48, bold: true, color: '1e40af' })]
    }))
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
      children: [new TextRun({ text: `${department} · ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, font: 'Arial', size: 20, color: '64748b' })]
    }))

    const heading = (text) => new Paragraph({
      spacing: { before: 300, after: 100 },
      children: [new TextRun({ text, font: 'Arial', size: 26, bold: true, color: '0891b2' })]
    })

    const body = (text) => new Paragraph({
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text: text || '', font: 'Arial', size: 22, color: '374151' })]
    })

    // Purpose
    if (result.purpose) {
      children.push(heading('Purpose'))
      children.push(body(result.purpose))
    }

    // Scope
    if (result.scope) {
      children.push(heading('Scope'))
      children.push(body(result.scope))
    }

    // Steps
    if (steps.length > 0) {
      children.push(heading('Procedure'))
      steps.forEach((step, i) => {
        const num = step.number || i + 1
        const action = step.action || step.title || ''
        children.push(new Paragraph({
          spacing: { before: 160, after: 40 },
          children: [
            new TextRun({ text: `Step ${num}: `, font: 'Arial', size: 22, bold: true, color: '0891b2' }),
            new TextRun({ text: action, font: 'Arial', size: 22, bold: true, color: '0f172a' })
          ]
        }))
        if (step.tool && step.tool !== 'To be specified based on actual workflow tooling') {
          children.push(new Paragraph({
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text: `🔧 Tool: ${step.tool}`, font: 'Arial', size: 20, color: '0891b2' })]
          }))
        }
        if (step.note) {
          children.push(new Paragraph({
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text: `💡 Note: ${step.note}`, font: 'Arial', size: 20, color: '0369a1' })]
          }))
        }
        if (step.conditional && step.conditional !== 'null' && step.conditional !== null) {
          children.push(new Paragraph({
            spacing: { before: 30, after: 30 },
            children: [new TextRun({ text: `⚡ If: ${step.conditional}`, font: 'Arial', size: 20, color: 'd97706' })]
          }))
        }
      })
    }

    // Expected outcome
    if (result.expected_outcome) {
      children.push(heading('Expected Outcome'))
      children.push(body(result.expected_outcome))
    }

    // Footer
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 },
      children: [new TextRun({ text: 'Generated with Snapproc · snapproc.com', font: 'Arial', size: 18, color: '94a3b8' })]
    }))

    const doc = new Document({
      sections: [{
        properties: {
          page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
        },
        children
      }]
    })

    const buffer = await Packer.toBuffer(doc)
    const docx = Buffer.from(buffer).toString('base64')
    return NextResponse.json({ docx })
  } catch(err) {
    console.error('DOCX error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
