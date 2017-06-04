<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:xs="http://www.w3.org/2001/XMLSchema"
  xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
  exclude-result-prefixes="#all"
  xmlns:rng="http://relaxng.org/ns/structure/1.0"
  xmlns="http://www.tei-c.org/ns/1.0"
  xpath-default-namespace="http://www.tei-c.org/ns/1.0"
  version="2.0">
  <xd:doc scope="stylesheet">
    <xd:desc>
      <xd:p><xd:b>Created on:</xd:b> Dec 20, 2015</xd:p>
      <xd:p><xd:b>Author:</xd:b> mholmes</xd:p>
      <xd:p>This pre-processor is designed to take information from 
      the header of the ODD (taxonomy declarations etc.) and use it 
      to constrain the contents of attributes. The idea is that 
      the ODD file is more easily maintainable if some decisions are
      defined using convenient structures such as taxonomies and 
      categories, and that these items can be pointed to from 
      attributes.</xd:p>
    </xd:desc>
  </xd:doc>
  
  <xsl:variable name="bibliography" select="doc('../bibl.xml')"/>
  
  <xsl:output xml:space="preserve" method="xml" encoding="UTF-8" exclude-result-prefixes="#all" normalization-form="NFC" indent="yes"/>
  
  
  <xd:doc scope="component">
    <xd:desc>Generate @ana values for list[@type='clues']/item from taxonomy.</xd:desc>
  </xd:doc>
  <xsl:template match="elementSpec[@ident='item']">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
      <attList>
        <attDef ident="ana" mode="change">
          <valList type="closed" mode="add">
            <xsl:for-each select="//taxonomy[@xml:id='clueTypes']/category">
              <valItem ident="crs:{@xml:id}">
                <gloss><xsl:value-of select="gloss"/></gloss>
                <desc><xsl:value-of select="desc"/></desc>
              </valItem>
            </xsl:for-each>
          </valList>
        </attDef>
      </attList>
    </xsl:copy>
  </xsl:template>
  
  <xd:doc scope="component">
    <xd:desc>Generate @ana values for list[@type='clues']/descendant::seg and span from taxonomy.</xd:desc>
  </xd:doc>
  <xsl:template match="elementSpec[@ident='seg'] | elementSpec[@ident='span']">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
      <attList>
        <attDef ident="ana" mode="change">
          <valList type="closed" mode="add">
            <xsl:for-each select="//taxonomy[@xml:id='clueComponents']/category">
              <valItem ident="crs:{@xml:id}">
                <gloss><xsl:value-of select="gloss"/></gloss>
                <desc><xsl:value-of select="desc"/></desc>
              </valItem>
            </xsl:for-each>
          </valList>
        </attDef>
      </attList>
    </xsl:copy>
  </xsl:template>
  
  <xd:doc scope="component">
    <xd:desc>Generate @source values from bibliography entries.</xd:desc>
  </xd:doc>
  <xsl:template match="classSpec[@ident='att.global.source']/attList/attDef[@ident='source']/valList">
    <xsl:copy>
      <xsl:apply-templates select="@* | node()"/>
      <valItem ident="bibl:UNKNOWN">
        <gloss>Unknown source</gloss>
        <desc>Item, clue or puzzle whose original source is unknown.</desc>
      </valItem>
      <xsl:for-each select="$bibliography//bibl[@xml:id]">
        <valItem ident="bibl:{@xml:id}">
          <gloss><xsl:value-of select="@n"/></gloss>
          <desc><xsl:value-of select="."/></desc>
        </valItem>
      </xsl:for-each>
    </xsl:copy>
  </xsl:template>
  
<!-- Annoying things that need suppression. -->
  <xd:doc scope="component">
    <xd:desc>Suppress a bunch of unwanted things that might appear as a result
      of transformation/expansion of ODD.</xd:desc>
  </xd:doc>
  <xsl:template match="@part | @default | @full | @instant | @ns | @org | @predeclare
                       | @status | schemaSpec/@mode | teiHeader/@type"/>
  
  
  
  <xd:doc scope="component">
    <xd:desc>Default identity transform.</xd:desc>
  </xd:doc>
  <xsl:template match="@*|node()" priority="-1">
    <xsl:copy copy-namespaces="no">
      <xsl:apply-templates select="node()|@*"/>
    </xsl:copy>
  </xsl:template>
  
</xsl:stylesheet>