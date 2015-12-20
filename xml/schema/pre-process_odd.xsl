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
  
  <xsl:output xml:space="preserve" method="xml" encoding="UTF-8" exclude-result-prefixes="#all" normalization-form="NFC" indent="yes"/>
  
  
<!--  Generate @ana values for list[@type='clues']/item. -->
  <xsl:template match="elementSpec[@ident='item']">
    <xsl:copy>
      <xsl:copy-of select="@* | node()"/>
      <attList>
        <attDef ident="ana" mode="replace">
          <datatype minOccurs="1">
            <rng:ref name="data.enumerated"/>
          </datatype>
          <valList type="closed">
            <xsl:for-each select="//taxonomy[@xml:id='clueTypes']/category">
              <valItem ident="crs:{@xml:id}">
                <desc><xsl:value-of select="catDesc"/></desc>
              </valItem>
            </xsl:for-each>
          </valList>
        </attDef>
      </attList>
    </xsl:copy>
  </xsl:template>
  
  <!--  Generate @ana values for list[@type='clues']/descendant::seg. -->
  <xsl:template match="elementSpec[@ident='seg']">
    <xsl:copy>
      <xsl:copy-of select="@* | node()"/>
      <attList>
        <attDef ident="ana" mode="replace">
          <datatype minOccurs="1">
            <rng:ref name="data.enumerated"/>
          </datatype>
          <valList type="closed">
            <xsl:for-each select="//taxonomy[@xml:id='clueComponents']/category">
              <valItem ident="crs:{@xml:id}">
                <desc><xsl:value-of select="catDesc"/></desc>
              </valItem>
            </xsl:for-each>
          </valList>
        </attDef>
      </attList>
    </xsl:copy>
  </xsl:template>
  
  
  
  <!-- Copy everything else as-is. -->
  <xsl:template match="@*|node()" priority="-1">
    <xsl:copy copy-namespaces="no">
      <xsl:apply-templates select="node()|@*"/>
    </xsl:copy>
  </xsl:template>
  
</xsl:stylesheet>